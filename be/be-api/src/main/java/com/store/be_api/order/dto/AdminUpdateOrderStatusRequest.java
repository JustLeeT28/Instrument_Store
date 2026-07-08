package com.store.be_api.order.dto;

import com.store.be_api.order.OrderStatus;

import jakarta.validation.constraints.NotNull;
public class AdminUpdateOrderStatusRequest {
    @NotNull
    private OrderStatus status;

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}