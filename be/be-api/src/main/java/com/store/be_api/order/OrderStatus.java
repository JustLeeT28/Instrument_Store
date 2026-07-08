package com.store.be_api.order;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum OrderStatus {
    PREPARING("preparing", "Chuẩn bị hàng"),
    SHIPPING("shipping", "Đang vận chuyển"),
    DELIVERED("delivered", "Đã giao hàng"),
    CANCELLED("cancelled", "Bị huỷ");

    private final String value;
    private final String label;

    OrderStatus(String value, String label) {
        this.value = value;
        this.label = label;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static OrderStatus fromValue(String value) {
        if (value == null) {
            return null;
        }

        return switch (value.trim().toLowerCase()) {
            case "preparing", "pending", "confirmed" -> PREPARING;
            case "shipping" -> SHIPPING;
            case "delivered" -> DELIVERED;
            case "cancelled", "canceled" -> CANCELLED;
            default -> throw new IllegalArgumentException("Unknown order status: " + value);
        };
    }
}