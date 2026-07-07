package com.store.be_api.order.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private java.util.List<String> productIds;

    @JsonAlias({"voucherCode"})
    private String couponCode;
}