package com.store.be_api.payment;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentSessionRepository extends JpaRepository<PaymentSession, UUID> {
    Optional<PaymentSession> findByPayosOrderCode(Long payosOrderCode);
}
