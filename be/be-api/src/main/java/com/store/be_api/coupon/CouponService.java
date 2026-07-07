package com.store.be_api.coupon;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.store.be_api.coupon.dto.CouponResponse;
import com.store.be_api.coupon.dto.CouponUpsertRequest;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CouponService {

    private final CouponRepository couponRepository;

    public List<CouponResponse> listCoupons() {
        return couponRepository.findAll(Sort.by(Sort.Order.desc("active"), Sort.Order.asc("code")))
                .stream()
                .map(CouponResponse::fromCoupon)
                .toList();
    }

    @Transactional
    @SuppressWarnings("null")
    public CouponResponse createCoupon(CouponUpsertRequest request) {
        String code = normalizeCode(request.getCode());
        assertCodeAvailable(code, null);

        Coupon coupon = Coupon.builder()
                .code(code)
                .discountType(normalizeDiscountType(request.getDiscountType()))
                .discountValue(request.getDiscountValue())
                .quantity(request.getQuantity())
                .minOrderValue(request.getMinOrderValue())
                .maxDiscountValue(request.getMaxDiscountValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.getActive())
                .build();

        Coupon savedCoupon = couponRepository.save(coupon);
        return CouponResponse.fromCoupon(savedCoupon);
    }

    @Transactional
    public CouponResponse updateCoupon(UUID id, CouponUpsertRequest request) {
        UUID couponId = Objects.requireNonNull(id, "id");
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher khong ton tai"));

        String code = normalizeCode(request.getCode());
        assertCodeAvailable(code, coupon.getId());

        coupon.setCode(code);
        coupon.setDiscountType(normalizeDiscountType(request.getDiscountType()));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setQuantity(request.getQuantity());
        coupon.setMinOrderValue(request.getMinOrderValue());
        coupon.setMaxDiscountValue(request.getMaxDiscountValue());
        coupon.setStartDate(request.getStartDate());
        coupon.setEndDate(request.getEndDate());
        coupon.setActive(request.getActive());

        return CouponResponse.fromCoupon(couponRepository.save(coupon));
    }

    @Transactional
    public void deleteCoupon(UUID id) {
        UUID couponId = Objects.requireNonNull(id, "id");
        if (!couponRepository.existsById(couponId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Voucher khong ton tai");
        }
        couponRepository.deleteById(couponId);
    }

    private void assertCodeAvailable(String code, UUID currentId) {
        couponRepository.findByCodeIgnoreCase(code)
                .filter(existing -> currentId == null || !existing.getId().equals(currentId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Ma voucher da ton tai");
                });
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui long nhap ma voucher");
        }
        return code.trim().toUpperCase();
    }

    private String normalizeDiscountType(String discountType) {
        if (discountType == null || discountType.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui long chon kieu giam gia");
        }

        String normalized = discountType.trim().toLowerCase();
        if (!"percent".equals(normalized) && !"fixed".equals(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kieu giam gia khong hop le");
        }

        return normalized;
    }
}