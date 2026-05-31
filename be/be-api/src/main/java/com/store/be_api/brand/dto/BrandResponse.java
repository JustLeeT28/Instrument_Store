package com.store.be_api.brand.dto;

import com.store.be_api.brand.Brand;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrandResponse {
    private UUID id;
    private String name;
    private String slug;

    public static BrandResponse fromEntity(Brand brand) {
        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .slug(brand.getSlug())
                .build();
    }
}
