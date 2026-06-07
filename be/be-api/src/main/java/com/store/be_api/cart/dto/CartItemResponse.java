package com.store.be_api.cart.dto;

import com.store.be_api.product.dto.ProductDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private ProductDto product;
    private int quantity;
    private double lineTotal;
}
