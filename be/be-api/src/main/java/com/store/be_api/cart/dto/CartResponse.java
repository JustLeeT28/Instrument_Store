package com.store.be_api.cart.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    @Builder.Default
    private List<CartItemResponse> items = List.of();
    private int itemCount;
    private double subtotal;
}
