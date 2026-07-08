package com.store.be_api.payment;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSessionItemSnapshot {
    private UUID productId;
    private String productName;
    private String variantName;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal lineTotal;
    private String image;
}
