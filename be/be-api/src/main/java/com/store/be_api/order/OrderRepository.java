package com.store.be_api.order;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.store.be_api.user.User;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    long countByUser(User user);
}