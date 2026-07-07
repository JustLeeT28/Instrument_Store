package com.store.be_api.order;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.store.be_api.cart.CartService;
import com.store.be_api.cart.dto.CartItemResponse;
import com.store.be_api.cart.dto.CartResponse;
import com.store.be_api.order.dto.OrderItemResponse;
import com.store.be_api.order.dto.OrderListResponse;
import com.store.be_api.order.dto.OrderResponse;
import com.store.be_api.product.Product;
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

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    @Transactional
    public OrderResponse checkout(Authentication authentication, List<UUID> productIds) {
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

        Order order = Order.builder()
                .id(orderId)
                .user(user)
                .orderCode(orderCode)
                .status("pending")
                .paymentMethod("COD")
                .discountAmount(BigDecimal.ZERO)
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

        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setTotal(subtotal.add(order.getShippingFee()).subtract(order.getDiscountAmount()));

        orderRepository.save(order);

        // Remove only checked-out items from cart
        cartService.removeItems(authentication, productIds);

        return toResponse(order);
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
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = new ArrayList<>();
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemResponses.add(OrderItemResponse.builder()
                        .id(item.getId().toString())
                        .productName(item.getProductName())
                        .variantName(item.getVariantName())
                        .unitPrice(item.getUnitPrice().doubleValue())
                        .quantity(item.getQuantity())
                        .lineTotal(item.getLineTotal().doubleValue())
                        .image(null)
                        .build());
            }
        }

        String createdAt = order.getCreatedAt() != null
                ? order.getCreatedAt().format(DATE_FORMATTER)
                : null;

        return OrderResponse.builder()
                .id(order.getId().toString())
                .orderCode(order.getDisplayOrderCode())
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

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui long dang nhap");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}