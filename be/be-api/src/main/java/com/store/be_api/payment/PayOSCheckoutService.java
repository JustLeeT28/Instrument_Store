package com.store.be_api.payment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.be_api.cart.CartService;
import com.store.be_api.cart.dto.CartItemResponse;
import com.store.be_api.cart.dto.CartResponse;
import com.store.be_api.coupon.Coupon;
import com.store.be_api.coupon.CouponRepository;
import com.store.be_api.order.Order;
import com.store.be_api.order.OrderItem;
import com.store.be_api.order.OrderRepository;
import com.store.be_api.order.OrderStatus;
import com.store.be_api.order.dto.CheckoutResponse;
import com.store.be_api.product.Product;
import com.store.be_api.product.ProductImage;
import com.store.be_api.product.ProductRepository;
import com.store.be_api.user.User;
import com.store.be_api.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PayOSCheckoutService {

    private final CartService cartService;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final PaymentSessionRepository paymentSessionRepository;
    private final PayOSService payOSService;
    private final PayOSProperties payOSProperties;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public PayOSCheckoutService(
            CartService cartService,
            CouponRepository couponRepository,
            OrderRepository orderRepository,
            PaymentSessionRepository paymentSessionRepository,
            PayOSService payOSService,
            PayOSProperties payOSProperties,
            ProductRepository productRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.cartService = cartService;
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
        this.paymentSessionRepository = paymentSessionRepository;
        this.payOSService = payOSService;
        this.payOSProperties = payOSProperties;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public CheckoutResponse createCheckout(Authentication authentication, List<UUID> productIds, String couponCode) {
        User user = getAuthenticatedUser(authentication);
        CartResponse cart = cartService.getCart(authentication);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gio hang trong");
        }

        if (productIds == null || productIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui long chon san pham de thanh toan");
        }

        Set<UUID> selectedSet = new HashSet<>(productIds);
        List<CartItemResponse> selectedItems = cart.getItems().stream()
                .filter(item -> selectedSet.contains(item.getProduct().getId()))
                .toList();

        if (selectedItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong tim thay san pham da chon trong gio hang");
        }

        List<PaymentSessionItemSnapshot> snapshots = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItemResponse cartItem : selectedItems) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "San pham khong ton tai: " + cartItem.getProduct().getName()));

            if (product.getStockQty() < cartItem.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "San pham \"" + product.getName() + "\" khong du hang (con " + product.getStockQty() + ")");
            }

            BigDecimal unitPrice = BigDecimal.valueOf(cartItem.getProduct().getPrice());
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            snapshots.add(PaymentSessionItemSnapshot.builder()
                    .productId(cartItem.getProduct().getId())
                    .productName(cartItem.getProduct().getName())
                    .variantName(cartItem.getProduct().getBrand())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal)
                    .image(cartItem.getProduct().getImage())
                    .build());
        }

        Coupon coupon = resolveCoupon(couponCode, subtotal);
        BigDecimal discountAmount = coupon != null ? calculateDiscountAmount(subtotal, coupon) : BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discountAmount);

        UUID sessionId = UUID.randomUUID();
        long payosOrderCode = generatePayOSOrderCode(sessionId);
        String returnUrl = payOSProperties.getFrontendBaseUrl() + "/orders?payment=success&orderCode=" + payosOrderCode;
        String cancelUrl = payOSProperties.getFrontendBaseUrl() + "/orders?payment=cancelled&orderCode=" + payosOrderCode;

        Order transientOrder = Order.builder()
                .id(sessionId)
                .orderCode(buildOrderCode())
                .payosOrderCode(payosOrderCode)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(BigDecimal.ZERO)
                .total(total)
                .user(user)
                .status(OrderStatus.PREPARING)
                .paymentMethod("PAYOS")
                .build();

        List<OrderItem> transientOrderItems = new ArrayList<>();
        for (PaymentSessionItemSnapshot snapshot : snapshots) {
            transientOrderItems.add(OrderItem.builder()
                    .productName(snapshot.getProductName())
                    .variantName(snapshot.getVariantName())
                    .unitPrice(snapshot.getUnitPrice())
                    .quantity(snapshot.getQuantity())
                    .lineTotal(snapshot.getLineTotal())
                    .build());
        }

        PayOSService.PaymentLinkResult paymentLink =
                payOSService.createPaymentLink(transientOrder, user, transientOrderItems);

        PaymentSession session = PaymentSession.builder()
                .user(user)
                .payosOrderCode(payosOrderCode)
                .checkoutUrl(paymentLink.checkoutUrl())
                .paymentMethod("PAYOS")
                .couponId(coupon != null ? coupon.getId() : null)
                .couponCode(coupon != null ? coupon.getCode() : null)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(BigDecimal.ZERO)
                .total(total)
                .productIdsJson(writeJson(productIds))
                .itemsJson(writeJson(snapshots))
                .build();
        paymentSessionRepository.save(session);

        return CheckoutResponse.builder()
                .checkoutUrl(paymentLink.checkoutUrl())
                .payosOrderCode(payosOrderCode)
                .build();
    }

    @Transactional
    public void handleWebhook(PayOSWebhookRequest request) {
        if (request == null || request.getData() == null || request.getSignature() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Du lieu webhook khong hop le");
        }

        if (!isValidWebhook(request.getData(), request.getSignature())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chu ky webhook khong hop le");
        }

        Long payosOrderCode = request.getData().getOrderCode();
        if (payosOrderCode == null) {
            return;
        }

        PaymentSession session = paymentSessionRepository.findByPayosOrderCode(payosOrderCode).orElse(null);
        if (session == null || session.getStatus() == PaymentSessionStatus.COMPLETED) {
            return;
        }

        boolean success = Boolean.TRUE.equals(request.getSuccess()) && "00".equals(request.getData().getCode());
        if (!success) {
            session.setStatus(PaymentSessionStatus.CANCELLED);
            paymentSessionRepository.save(session);
            return;
        }

        List<PaymentSessionItemSnapshot> snapshots = readSnapshots(session.getItemsJson());
        List<UUID> productIds = readProductIds(session.getProductIdsJson());

        if (productIds.isEmpty() || snapshots.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session thanh toan khong hop le");
        }

        Order order = createOrderFromSession(session, snapshots);
        session.setStatus(PaymentSessionStatus.COMPLETED);
        session.setCompletedOrderId(order.getId());
        paymentSessionRepository.save(session);
    }

    @Transactional
    public UUID confirmSuccessfulPayment(Authentication authentication, Long payosOrderCode) {
        if (payosOrderCode == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PayOS order code is required");
        }

        PaymentSession session = paymentSessionRepository.findByPayosOrderCode(payosOrderCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment session not found"));

        if (authentication != null && authentication.getName() != null) {
            User currentUser = getAuthenticatedUser(authentication);
            if (session.getUser() == null || !session.getUser().getId().equals(currentUser.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        }

        if (session.getStatus() == PaymentSessionStatus.COMPLETED && session.getCompletedOrderId() != null) {
            return session.getCompletedOrderId();
        }

        if (session.getStatus() == PaymentSessionStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment was cancelled");
        }

        List<PaymentSessionItemSnapshot> snapshots = readSnapshots(session.getItemsJson());
        Order order = createOrderFromSession(session, snapshots);
        session.setStatus(PaymentSessionStatus.COMPLETED);
        session.setCompletedOrderId(order.getId());
        paymentSessionRepository.save(session);
        return order.getId();
    }

    private Order createOrderFromSession(PaymentSession session, List<PaymentSessionItemSnapshot> snapshots) {
        User user = userRepository.findById(session.getUser().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Order order = Order.builder()
                .id(UUID.randomUUID())
                .user(user)
                .orderCode(buildOrderCode())
                .status(OrderStatus.PREPARING)
                .paymentMethod("PAYOS")
                .shippingFee(session.getShippingFee())
                .couponId(session.getCouponId())
                .discountAmount(session.getDiscountAmount())
                .subtotal(session.getSubtotal())
                .total(session.getTotal())
                .build();

        List<OrderItem> orderItems = new ArrayList<>();
        for (PaymentSessionItemSnapshot snapshot : snapshots) {
            Product product = productRepository.findById(snapshot.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "San pham khong ton tai: " + snapshot.getProductName()));

            if (product.getStockQty() < snapshot.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "San pham \"" + product.getName() + "\" khong du hang (con " + product.getStockQty() + ")");
            }

            product.setStockQty(product.getStockQty() - snapshot.getQuantity());
            productRepository.save(product);

            orderItems.add(OrderItem.builder()
                    .order(order)
                    .variantId(snapshot.getProductId())
                    .productName(snapshot.getProductName())
                    .variantName(snapshot.getVariantName())
                    .unitPrice(snapshot.getUnitPrice())
                    .quantity(snapshot.getQuantity())
                    .lineTotal(snapshot.getLineTotal())
                    .build());
        }

        order.setItems(orderItems);
        OffsetDateTime now = OffsetDateTime.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);
        orderRepository.save(order);

        if (session.getCouponId() != null) {
            couponRepository.findById(session.getCouponId()).ifPresent(coupon -> {
                Integer quantity = coupon.getQuantity();
                if (quantity != null && quantity > 0) {
                    coupon.setQuantity(quantity - 1);
                    couponRepository.save(coupon);
                }
            });
        }

        cartService.removeItemsByUserId(user.getId(), readProductIds(session.getProductIdsJson()));
        return order;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui long dang nhap");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Coupon resolveCoupon(String couponCode, BigDecimal subtotal) {
        if (couponCode == null || couponCode.isBlank()) {
            return null;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(couponCode.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher khong ton tai"));

        if (coupon.getActive() == null || !coupon.getActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher da bi khoa");
        }

        if (coupon.getQuantity() == null || coupon.getQuantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher da het so luong");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher chua bat dau");
        }
        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher da het han");
        }

        if (coupon.getMinOrderValue() != null && subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Don hang chua du dieu kien ap dung voucher");
        }

        return coupon;
    }

    private BigDecimal calculateDiscountAmount(BigDecimal subtotal, Coupon coupon) {
        if (coupon == null || coupon.getDiscountValue() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal discountAmount;
        if ("percent".equalsIgnoreCase(coupon.getDiscountType())) {
            discountAmount = subtotal
                    .multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscountValue() != null && discountAmount.compareTo(coupon.getMaxDiscountValue()) > 0) {
                discountAmount = coupon.getMaxDiscountValue();
            }
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        if (discountAmount.compareTo(subtotal) > 0) {
            discountAmount = subtotal;
        }

        return discountAmount.setScale(2, RoundingMode.HALF_UP);
    }

    private long generatePayOSOrderCode(UUID value) {
        long combined = value.getMostSignificantBits() ^ value.getLeastSignificantBits();
        long normalized = Long.remainderUnsigned(combined, 9_000_000_000L);
        return 1_000_000_000L + normalized;
    }

    private String buildOrderCode() {
        String uuid = UUID.randomUUID().toString().replaceAll("-", "").toUpperCase();
        return "ORD-" + uuid.substring(0, 8);
    }

    private List<UUID> readProductIds(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<UUID>>() {});
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong doc duoc productIds", ex);
        }
    }

    private List<PaymentSessionItemSnapshot> readSnapshots(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<PaymentSessionItemSnapshot>>() {});
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong doc duoc item snapshot", ex);
        }
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong the tao du lieu thanh toan", ex);
        }
    }

    private boolean isValidWebhook(PayOSWebhookRequest.WebhookData data, String signature) {
        try {
            Map<String, Object> payload = objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {});
            String computed = payload.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> entry.getKey() + "=" + encodeValue(entry.getValue()))
                    .reduce((left, right) -> left + "&" + right)
                    .map(value -> {
                        try {
                            return hmacSha256(value, payOSProperties.getChecksumKey());
                        } catch (Exception ex) {
                            throw new RuntimeException(ex);
                        }
                    })
                    .orElse("");
            return computed.equalsIgnoreCase(signature);
        } catch (Exception ex) {
            return false;
        }
    }

    private String encodeValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof Number number) {
            return number.toString();
        }
        if (value instanceof Boolean bool) {
            return bool.toString();
        }
        return String.valueOf(value);
    }

    private String hmacSha256(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(bytes);
    }

}
