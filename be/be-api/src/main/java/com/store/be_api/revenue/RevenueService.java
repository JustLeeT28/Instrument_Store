package com.store.be_api.revenue;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.store.be_api.order.Order;
import com.store.be_api.order.OrderItem;
import com.store.be_api.order.OrderRepository;
import com.store.be_api.revenue.dto.RevenueStatsResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RevenueService {

    private static final int DEFAULT_RANGE_DAYS = 30;
    private static final int TOP_PRODUCT_LIMIT = 5;
    private static final String CANCELLED_STATUS = "cancelled";

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public RevenueStatsResponse getRevenueStats(LocalDate requestedStartDate, LocalDate requestedEndDate) {
        LocalDate endDate = requestedEndDate != null ? requestedEndDate : LocalDate.now();
        LocalDate startDate = requestedStartDate != null ? requestedStartDate : endDate.minusDays(DEFAULT_RANGE_DAYS - 1L);

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Ngay bat dau khong duoc lon hon ngay ket thuc");
        }

        ZoneId zoneId = ZoneId.systemDefault();
        OffsetDateTime start = startDate.atStartOfDay(zoneId).toOffsetDateTime();
        OffsetDateTime end = endDate.plusDays(1).atStartOfDay(zoneId).toOffsetDateTime().minusNanos(1);

        List<Order> orders = orderRepository.findByCreatedAtBetweenOrderByCreatedAtAsc(start, end);
        Map<LocalDate, DailyAccumulator> daily = initializeDailyBuckets(startDate, endDate);
        Map<String, ProductAccumulator> products = new LinkedHashMap<>();

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal grossRevenue = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        int totalOrders = orders.size();
        int countedOrders = 0;
        int cancelledOrders = 0;
        int soldItems = 0;

        for (Order order : orders) {
            boolean cancelled = isCancelled(order.getStatus());
            if (cancelled) {
                cancelledOrders++;
                continue;
            }

            BigDecimal orderTotal = valueOrZero(order.getTotal());
            BigDecimal orderSubtotal = valueOrZero(order.getSubtotal());
            BigDecimal discount = valueOrZero(order.getDiscountAmount());
            LocalDate orderDate = order.getCreatedAt().atZoneSameInstant(zoneId).toLocalDate();
            DailyAccumulator dailyAccumulator = daily.get(orderDate);

            totalRevenue = totalRevenue.add(orderTotal);
            grossRevenue = grossRevenue.add(orderSubtotal);
            totalDiscount = totalDiscount.add(discount);
            countedOrders++;

            if (dailyAccumulator != null) {
                dailyAccumulator.revenue = dailyAccumulator.revenue.add(orderTotal);
                dailyAccumulator.orders++;
            }

            if (order.getItems() == null) {
                continue;
            }

            for (OrderItem item : order.getItems()) {
                int quantity = item.getQuantity();
                BigDecimal lineTotal = valueOrZero(item.getLineTotal());
                soldItems += quantity;

                ProductAccumulator product = products.computeIfAbsent(item.getProductName(), ProductAccumulator::new);
                product.quantity += quantity;
                product.revenue = product.revenue.add(lineTotal);
            }
        }

        BigDecimal averageOrderValue = countedOrders == 0
                ? BigDecimal.ZERO
                : totalRevenue.divide(BigDecimal.valueOf(countedOrders), 2, RoundingMode.HALF_UP);

        return RevenueStatsResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalRevenue(totalRevenue)
                .grossRevenue(grossRevenue)
                .totalDiscount(totalDiscount)
                .averageOrderValue(averageOrderValue)
                .totalOrders(totalOrders)
                .countedOrders(countedOrders)
                .cancelledOrders(cancelledOrders)
                .soldItems(soldItems)
                .dailyRevenue(toDailyResponses(daily))
                .topProducts(toTopProductResponses(products))
                .build();
    }

    private Map<LocalDate, DailyAccumulator> initializeDailyBuckets(LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, DailyAccumulator> result = new LinkedHashMap<>();
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            result.put(current, new DailyAccumulator(current));
            current = current.plusDays(1);
        }

        return result;
    }

    private List<RevenueStatsResponse.DailyRevenue> toDailyResponses(Map<LocalDate, DailyAccumulator> daily) {
        return daily.values().stream()
                .map(item -> RevenueStatsResponse.DailyRevenue.builder()
                        .date(item.date)
                        .revenue(item.revenue)
                        .orders(item.orders)
                        .build())
                .toList();
    }

    private List<RevenueStatsResponse.TopProduct> toTopProductResponses(Map<String, ProductAccumulator> products) {
        return products.values().stream()
                .sorted(Comparator.comparing(ProductAccumulator::getRevenue).reversed())
                .limit(TOP_PRODUCT_LIMIT)
                .map(item -> RevenueStatsResponse.TopProduct.builder()
                        .productName(item.productName)
                        .quantity(item.quantity)
                        .revenue(item.revenue)
                        .build())
                .toList();
    }

    private boolean isCancelled(String status) {
        return status != null && CANCELLED_STATUS.equals(status.toLowerCase(Locale.ROOT));
    }

    private BigDecimal valueOrZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private static class DailyAccumulator {
        private final LocalDate date;
        private BigDecimal revenue = BigDecimal.ZERO;
        private int orders;

        private DailyAccumulator(LocalDate date) {
            this.date = date;
        }
    }

    private static class ProductAccumulator {
        private final String productName;
        private BigDecimal revenue = BigDecimal.ZERO;
        private int quantity;

        private ProductAccumulator(String productName) {
            this.productName = productName;
        }

        private BigDecimal getRevenue() {
            return revenue;
        }
    }
}
