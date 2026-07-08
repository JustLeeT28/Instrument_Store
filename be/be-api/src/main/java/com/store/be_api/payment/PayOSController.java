package com.store.be_api.payment;

import java.util.Map;
import java.util.UUID;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments/payos")
@RequiredArgsConstructor
public class PayOSController {

    private final PayOSCheckoutService payOSCheckoutService;

    @PostMapping("/webhook")
    public ResponseEntity<Map<String, Object>> webhook(@RequestBody PayOSWebhookRequest request) {
        payOSCheckoutService.handleWebhook(request);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/confirm/{payosOrderCode}")
    public ResponseEntity<Map<String, Object>> confirm(
            Authentication authentication,
            @PathVariable Long payosOrderCode) {
        UUID orderId = payOSCheckoutService.confirmSuccessfulPayment(authentication, payosOrderCode);
        return ResponseEntity.ok(Map.of("success", true, "orderId", orderId.toString()));
    }
}
