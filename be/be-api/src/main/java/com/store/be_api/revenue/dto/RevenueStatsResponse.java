package com.store.be_api.revenue.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatsResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalRevenue;
    private BigDecimal grossRevenue;
    private BigDecimal totalDiscount;
    private BigDecimal averageOrderValue;
    private int totalOrders;
    private int countedOrders;
    private int cancelledOrders;
    private int soldItems;
    private List<DailyRevenue> dailyRevenue;
    private List<TopProduct> topProducts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {
        private LocalDate date;
        private BigDecimal revenue;
        private int orders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private String productName;
        private int quantity;
        private BigDecimal revenue;
    }
}
