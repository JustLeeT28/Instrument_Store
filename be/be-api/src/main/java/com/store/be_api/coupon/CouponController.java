package com.store.be_api.coupon;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.store.be_api.coupon.dto.CouponResponse;
import com.store.be_api.coupon.dto.CouponUpsertRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public List<CouponResponse> listCoupons() {
        return couponService.listCoupons();
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public CouponResponse createCoupon(@Valid @RequestBody CouponUpsertRequest request) {
        return couponService.createCoupon(request);
    }

    @PatchMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CouponResponse updateCoupon(@PathVariable UUID id, @Valid @RequestBody CouponUpsertRequest request) {
        return couponService.updateCoupon(id, request);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCoupon(@PathVariable UUID id) {
        couponService.deleteCoupon(id);
    }
}