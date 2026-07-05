package com.store.be_api.product.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    private String name;
    private String slug;
    private String description;
    private Double price;
    private Integer stockQty;
    private List<ProductImagePayload> images;
    private List<Map<String, String>> specs;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductImagePayload {
        private String imageUrl;
        private Boolean isPrimary;
    }
}
