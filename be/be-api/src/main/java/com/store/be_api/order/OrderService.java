package com.store.be_api.order;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.store.be_api.order.dto.OrderItemResponse;
import com.store.be_api.order.dto.OrderListResponse;
import com.store.be_api.order.dto.OrderResponse;
import com.store.be_api.user.User;
import com.store.be_api.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

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