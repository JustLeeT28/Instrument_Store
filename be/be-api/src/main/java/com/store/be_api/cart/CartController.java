package com.store.be_api.cart;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.store.be_api.cart.dto.CartResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(Authentication authentication) {
        return cartService.getCart(authentication);
    }

    @PostMapping("/items/{productId}")
    public CartResponse addItem(
            Authentication authentication,
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "1") int quantity) {
        return cartService.addItem(authentication, productId, quantity);
    }

    @PutMapping("/items/{productId}")
    public CartResponse updateItem(
            Authentication authentication,
            @PathVariable UUID productId,
            @RequestParam int quantity) {
        return cartService.updateItem(authentication, productId, quantity);
    }

    @DeleteMapping("/items/{productId}")
    public CartResponse removeItem(Authentication authentication, @PathVariable UUID productId) {
        return cartService.removeItem(authentication, productId);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        cartService.clearCart(authentication);
        return ResponseEntity.noContent().build();
    }
}