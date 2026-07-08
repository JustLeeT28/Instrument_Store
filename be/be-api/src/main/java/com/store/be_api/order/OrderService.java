package com.store.be_api.order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Objects;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.store.be_api.cart.CartService;
import com.store.be_api.cart.dto.CartItemResponse;
import com.store.be_api.cart.dto.CartResponse;
import com.store.be_api.coupon.Coupon;
import com.store.be_api.coupon.CouponRepository;
import com.store.be_api.order.dto.AdminOrderListResponse;
import com.store.be_api.order.dto.AdminOrderResponse;
import com.store.be_api.order.dto.AdminUpdateOrderStatusRequest;
import com.store.be_api.order.dto.CheckoutResponse;
import com.store.be_api.order.dto.OrderItemResponse;
import com.store.be_api.order.dto.OrderListResponse;
import com.store.be_api.order.dto.OrderResponse;
import com.store.be_api.payment.PayOSService;
import com.store.be_api.product.Product;
import com.store.be_api.product.ProductImage;
import com.store.be_api.product.ProductRepository;
import com.store.be_api.user.User;
import com.store.be_api.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final PayOSService payOSService;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    @Transactional
    public CheckoutResponse checkout(Authentication authentication, List<UUID> productIds, String couponCode, String paymentMethod) {
        User user = getAuthenticatedUser(authentication);
        CartResponse cart = cartService.getCart(authentication);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gio hang trong");
        }

        if (productIds == null || productIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui long chon san pham de thanh toan");
        }

        Set<UUID> selectedSet = new HashSet<>(productIds);

        // Filter cart items to only those selected
        List<CartItemResponse> selectedItems = cart.getItems().stream()
                .filter(item -> selectedSet.contains(item.getProduct().getId()))
                .toList();

        if (selectedItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khong tim thay san pham da chon trong gio hang");
        }

        // Build order items from selected cart items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        UUID orderId = UUID.randomUUID();
        String orderCode = "ORD-" + orderId.toString().replaceAll("-", "").toUpperCase().substring(0, 8);

        boolean usePayOS = paymentMethod == null || paymentMethod.isBlank() || "PAYOS".equalsIgnoreCase(paymentMethod.trim());
        String normalizedPaymentMethod = usePayOS ? "PAYOS" : paymentMethod.trim().toUpperCase();

        Order order = Order.builder()
                .id(orderId)
                .user(user)
                .orderCode(orderCode)
                .status(usePayOS ? OrderStatus.PENDING_PAYMENT : OrderStatus.PREPARING)
                .paymentMethod(normalizedPaymentMethod)
                .shippingFee(BigDecimal.ZERO)
                .build();

        for (CartItemResponse cartItem : selectedItems) {
            // Subtract stock
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "San pham khong ton tai: " + cartItem.getProduct().getName()));

            if (product.getStockQty() < cartItem.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "San pham \"" + product.getName() + "\" khong du hang (con " + product.getStockQty() + ")");
            }

            product.setStockQty(product.getStockQty() - cartItem.getQuantity());
            productRepository.save(product);

            BigDecimal unitPrice = BigDecimal.valueOf(cartItem.getProduct().getPrice());
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .variantId(cartItem.getProduct().getId())
                    .productName(cartItem.getProduct().getName())
                    .variantName(cartItem.getProduct().getBrand())
                    .unitPrice(unitPrice)
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal)
                    .build();
            orderItems.add(orderItem);
        }

        Coupon coupon = resolveCoupon(couponCode, subtotal);
        BigDecimal discountAmount = coupon != null ? calculateDiscountAmount(subtotal, coupon) : BigDecimal.ZERO;

        if (coupon != null) {
            coupon.setQuantity(coupon.getQuantity() - 1);
            couponRepository.save(coupon);
        }

        order.setCouponId(coupon != null ? coupon.getId() : null);
        order.setDiscountAmount(discountAmount);
        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setTotal(subtotal.add(order.getShippingFee()).subtract(discountAmount));

        String checkoutUrl = null;
        if (usePayOS) {
            long payosOrderCode = generatePayOSOrderCode(orderId);
            order.setPayosOrderCode(payosOrderCode);
            PayOSService.PaymentLinkResult paymentLink = payOSService.createPaymentLink(order, user, orderItems);
            checkoutUrl = paymentLink.checkoutUrl();
            order.setPayosOrderCode(paymentLink.payosOrderCode());
        }

        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        if (order.getCreatedAt() == null) {
            order.setCreatedAt(now);
        }
        order.setUpdatedAt(now);

        orderRepository.save(order);

        // Remove only checked-out items from cart
        cartService.removeItems(authentication, productIds);

        return CheckoutResponse.builder()
                .order(toResponse(order))
                .checkoutUrl(checkoutUrl)
                .payosOrderCode(order.getPayosOrderCode())
                .build();
    }

    public OrderListResponse getOrders(Authentication authentication, int page, int size) {
        User user = getAuthenticatedUser(authentication);
        PageRequest pageRequest = PageRequest.of(page - 1, size);
        Page<Order> orderPage = orderRepository.findByUserOrderByCreatedAtDesc(user, pageRequest);
        long total = orderRepository.countByUser(user);

        List<OrderResponse> orders = orderPage.getContent().stream()
                .map(this::toResponse)
                .toList();

        return OrderListResponse.builder()
                .orders(orders)
                .total(total)
                .page(page)
                .size(size)
                .build();
    }

    public OrderResponse getOrderById(Authentication authentication, UUID orderId) {
        User user = getAuthenticatedUser(authentication);
        UUID lookupOrderId = Objects.requireNonNull(orderId, "orderId");
        Order order = orderRepository.findById(lookupOrderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return toResponse(order);
    }

    public AdminOrderListResponse getAdminOrders(int page, int size, OrderStatus status) {
        PageRequest pageRequest = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    Page<Order> orderPage = status == null
        ? orderRepository.findAll(pageRequest)
            : orderRepository.findByStatus(status, pageRequest);

    long total = status == null
        ? orderRepository.count()
        : orderRepository.countByStatus(status);

    List<AdminOrderResponse> orders = orderPage.getContent().stream()
        .map(this::toAdminResponse)
        .toList();

        AdminOrderListResponse response = new AdminOrderListResponse();
        response.setOrders(orders);
        response.setTotal(total);
        response.setPage(page);
        response.setSize(size);
        return response;
    }

    @Transactional
    public AdminOrderResponse updateAdminOrderStatus(UUID orderId, AdminUpdateOrderStatusRequest request) {
        UUID lookupOrderId = Objects.requireNonNull(orderId, "orderId");
        Order order = orderRepository.findById(lookupOrderId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

    if (request == null || request.getStatus() == null) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
    }

    order.setStatus(request.getStatus());
    orderRepository.save(order);
    return toAdminResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                String productImage = null;
                if (item.getVariantId() != null) {
                    Product product = productRepository.findById(item.getVariantId()).orElse(null);
                    if (product != null) {
                        List<ProductImage> images = product.getImages();
                        if (images != null && !images.isEmpty()) {
                            ProductImage primary = images.stream()
                                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                                    .findFirst()
                                    .orElse(images.get(0));
                            productImage = primary.getImageUrl();
                        }
                    }
                }
                itemResponses.add(OrderItemResponse.builder()
                        .id(item.getId().toString())
                        .productName(item.getProductName())
                        .variantName(item.getVariantName())
                        .unitPrice(item.getUnitPrice().doubleValue())
                        .quantity(item.getQuantity())
                        .lineTotal(item.getLineTotal().doubleValue())
                        .image(productImage)
                        .build());
            }
        }

        String createdAt = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DATE_FORMATTER)
                : null;

        return OrderResponse.builder()
                .id(order.getId().toString())
                .orderCode(order.getDisplayOrderCode())
                .couponCode(resolveCouponCode(order.getCouponId()))
                .status(order.getStatus())
                .subtotal(order.getSubtotal().doubleValue())
                .discountAmount(order.getDiscountAmount().doubleValue())
                .shippingFee(order.getShippingFee().doubleValue())
                .total(order.getTotal().doubleValue())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(createdAt)
                .items(itemResponses)
                .build();
    }

    private AdminOrderResponse toAdminResponse(Order order) {
        String createdAt = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DATE_FORMATTER)
                : null;

        AdminOrderResponse response = new AdminOrderResponse();
        response.setId(order.getId().toString());
        response.setOrderCode(order.getDisplayOrderCode());
        response.setCustomerName(order.getUser() != null ? order.getUser().getFullName() : null);
        response.setCustomerEmail(order.getUser() != null ? order.getUser().getEmail() : null);
        response.setStatus(order.getStatus());
        response.setSubtotal(order.getSubtotal().doubleValue());
        response.setDiscountAmount(order.getDiscountAmount().doubleValue());
        response.setShippingFee(order.getShippingFee().doubleValue());
        response.setTotal(order.getTotal().doubleValue());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setCreatedAt(createdAt);
        return response;
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

    private String resolveCouponCode(UUID couponId) {
        if (couponId == null) {
            return null;
        }

        return couponRepository.findById(couponId)
            .map(coupon -> coupon.getCode())
                .orElse(null);
    }

    private long generatePayOSOrderCode(UUID orderId) {
        long combined = orderId.getMostSignificantBits() ^ orderId.getLeastSignificantBits();
        long normalized = Long.remainderUnsigned(combined, 9_000_000_000L);
        return 1_000_000_000L + normalized;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui long dang nhap");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
