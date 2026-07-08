package com.store.be_api.brand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BrandUpsertRequest {
    @NotBlank(message = "Brand name is required")
    @Size(max = 120, message = "Brand name must be at most 120 characters")
    private String name;
}
