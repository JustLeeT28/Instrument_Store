package com.store.be_api.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private String id;
    private String productName;
    private String variantName;
    private double unitPrice;
    private int quantity;
    private double lineTotal;
    private String image;
}