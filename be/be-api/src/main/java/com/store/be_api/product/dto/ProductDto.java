package com.store.be_api.product.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private UUID id;
    private String name;
    private String slug;
    private String brand;
    private String category;
    private Double price;
    private Double rating;
    private Integer reviewCount;
    private String badge;
    private Integer stockQty;
    private String description;
    private String image;
    private java.util.Map<String, Object> specs;
}
