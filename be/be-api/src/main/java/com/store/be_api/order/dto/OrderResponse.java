package com.store.be_api.order.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private String id;
    private String orderCode;
    private String couponCode;
    private String status;
    private double subtotal;
    private double discountAmount;
    private double shippingFee;
    private double total;
    private String paymentMethod;
    private String createdAt;
    private List<OrderItemResponse> items;
}