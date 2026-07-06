package com.store.be_api.order.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListResponse {
    private List<OrderResponse> orders;
    private long total;
    private int page;
    private int size;
}