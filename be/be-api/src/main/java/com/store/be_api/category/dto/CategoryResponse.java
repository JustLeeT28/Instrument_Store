package com.store.be_api.category.dto;

import com.store.be_api.category.Category;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private UUID id;
    private String name;
    private String slug;
    private Integer position;

    public static CategoryResponse fromEntity(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .position(c.getPosition())
                .build();
    }
}
