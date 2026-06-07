package com.store.be_api.cart;

import com.store.be_api.cart.dto.CartResponse;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @GetMapping
    public CartResponse getCart(HttpSession session) {
        return cartService.getCart(session);
    }

    @PostMapping("/items/{productId}")
    public CartResponse addItem(
            HttpSession session,
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "1") int quantity) {
        return cartService.addItem(session, productId, quantity);
    }

    @PutMapping("/items/{productId}")
    public CartResponse updateItem(
            HttpSession session,
            @PathVariable UUID productId,
            @RequestParam int quantity) {
        return cartService.updateItem(session, productId, quantity);
    }

    @DeleteMapping("/items/{productId}")
    public CartResponse removeItem(HttpSession session, @PathVariable UUID productId) {
        return cartService.removeItem(session, productId);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(HttpSession session) {
        cartService.clearCart(session);
        return ResponseEntity.noContent().build();
    }
}
