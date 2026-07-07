package com.store.be_api.coupon;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
}