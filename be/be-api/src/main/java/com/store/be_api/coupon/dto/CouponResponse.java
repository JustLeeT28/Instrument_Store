package com.store.be_api.coupon.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import com.store.be_api.coupon.Coupon;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CouponResponse {
    private String id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private Integer quantity;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscountValue;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private Boolean active;

    public static CouponResponse fromCoupon(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId().toString())
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .quantity(coupon.getQuantity())
                .minOrderValue(coupon.getMinOrderValue())
                .maxDiscountValue(coupon.getMaxDiscountValue())
                .startDate(coupon.getStartDate())
                .endDate(coupon.getEndDate())
                .active(coupon.getActive())
                .build();
    }
}