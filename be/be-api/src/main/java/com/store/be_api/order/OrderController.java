package com.store.be_api.order;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RestController;

import com.store.be_api.order.dto.AdminOrderListResponse;
import com.store.be_api.order.dto.AdminOrderResponse;
import com.store.be_api.order.dto.AdminUpdateOrderStatusRequest;
import com.store.be_api.order.dto.CheckoutRequest;
import com.store.be_api.order.dto.CheckoutResponse;
import com.store.be_api.order.dto.OrderListResponse;
import com.store.be_api.order.dto.OrderResponse;
import com.store.be_api.payment.PayOSCheckoutService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PayOSCheckoutService payOSCheckoutService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(Authentication authentication, @RequestBody CheckoutRequest request) {
        List<UUID> productIds = request.getProductIds().stream()
                .map(UUID::fromString)
                .toList();
        CheckoutResponse checkout = payOSCheckoutService.createCheckout(authentication, productIds, request.getCouponCode());
        return ResponseEntity.ok(checkout);
    }

    @GetMapping
    public OrderListResponse getOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return orderService.getOrders(authentication, page, size);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            Authentication authentication,
            @PathVariable UUID orderId) {
        OrderResponse order = orderService.getOrderById(authentication, orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminOrderListResponse getAdminOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return orderService.getAdminOrders(page, size, status == null ? null : OrderStatus.fromValue(status));
    }

    @PatchMapping("/admin/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminOrderResponse updateAdminOrderStatus(
            @PathVariable UUID orderId,
            @RequestBody AdminUpdateOrderStatusRequest request) {
        return orderService.updateAdminOrderStatus(orderId, request);
    }
}
