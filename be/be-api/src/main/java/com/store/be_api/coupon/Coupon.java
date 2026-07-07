package com.store.be_api.coupon;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coupons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(nullable = false, unique = true)
    private String code;

    @Column(name = "discount_type", nullable = false)
    private String discountType;

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0;

    @Column(name = "min_order_value", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    @Column(name = "max_discount_value", precision = 12, scale = 2)
    private BigDecimal maxDiscountValue;

    @Column(name = "start_date")
    private OffsetDateTime startDate;

    @Column(name = "end_date")
    private OffsetDateTime endDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    public void onCreate() {
        if (quantity == null) {
            quantity = 0;
        }
        if (minOrderValue == null) {
            minOrderValue = BigDecimal.ZERO;
        }
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void onUpdate() {
        if (quantity == null) {
            quantity = 0;
        }
    }
}