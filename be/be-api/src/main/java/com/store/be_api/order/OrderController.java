package com.store.be_api.order;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.store.be_api.order.dto.CheckoutRequest;
import com.store.be_api.order.dto.OrderListResponse;
import com.store.be_api.order.dto.OrderResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(Authentication authentication, @RequestBody CheckoutRequest request) {
        List<UUID> productIds = request.getProductIds().stream()
                .map(UUID::fromString)
                .toList();
        OrderResponse order = orderService.checkout(authentication, productIds);
        return ResponseEntity.ok(order);
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
}