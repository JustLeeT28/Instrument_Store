package com.store.be_api.coupon.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponUpsertRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String discountType;

    @NotNull
    private BigDecimal discountValue;

    @NotNull
    @Min(0)
    private Integer quantity;

    @Builder.Default
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    private BigDecimal maxDiscountValue;

    private OffsetDateTime startDate;

    private OffsetDateTime endDate;

    @NotNull
    private Boolean active;
}