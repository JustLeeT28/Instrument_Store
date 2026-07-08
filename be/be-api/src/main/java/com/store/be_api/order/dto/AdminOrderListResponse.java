package com.store.be_api.order.dto;

import java.util.List;
public class AdminOrderListResponse {
    private List<AdminOrderResponse> orders;
    private long total;
    private int page;
    private int size;

    public List<AdminOrderResponse> getOrders() {
        return orders;
    }

    public void setOrders(List<AdminOrderResponse> orders) {
        this.orders = orders;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }
}