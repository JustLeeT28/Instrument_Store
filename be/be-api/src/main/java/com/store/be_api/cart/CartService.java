package com.store.be_api.cart;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.store.be_api.cart.dto.CartItemResponse;
import com.store.be_api.cart.dto.CartResponse;
import com.store.be_api.product.Product;
import com.store.be_api.product.ProductRepository;
import com.store.be_api.product.ProductService;
import com.store.be_api.product.dto.ProductDto;
import com.store.be_api.user.User;
import com.store.be_api.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = cartRepository.findByUser(user).orElse(null);
        return buildResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Authentication authentication, UUID productId, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than 0");
        }

        User user = getAuthenticatedUser(authentication);
        Product product = getProduct(productId);

        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = Cart.builder().user(user).build();
            return cartRepository.save(newCart);
        });

        // Check if product already exists in cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(newItem);
        }

        cartRepository.save(cart);
        return buildResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(Authentication authentication, UUID productId, int quantity) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = getCartOrThrow(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        return buildResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Authentication authentication, UUID productId) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = getCartOrThrow(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found in cart"));

        cart.getItems().remove(item);
        cartRepository.save(cart);
        return buildResponse(cart);
    }

    @Transactional
    public void clearCart(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Cart cart = cartRepository.findByUser(user).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cartRepository.save(cart);
        }
    }

    private Cart getCartOrThrow(User user) {
        return cartRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui long dang nhap");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Product getProduct(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private CartResponse buildResponse(Cart cart) {
        if (cart == null || cart.getItems() == null || cart.getItems().isEmpty()) {
            return CartResponse.builder()
                    .items(new ArrayList<>())
                    .itemCount(0)
                    .subtotal(0.0)
                    .build();
        }

        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int itemCount = 0;

        for (CartItem cartItem : cart.getItems()) {
            if (cartItem.getQuantity() <= 0) {
                continue;
            }

            ProductDto product = productService.getById(cartItem.getProduct().getId());
            BigDecimal lineTotal = cartItem.getLineTotal();
            subtotal = subtotal.add(lineTotal);
            itemCount += cartItem.getQuantity();

            items.add(CartItemResponse.builder()
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .lineTotal(lineTotal.doubleValue())
                    .build());
        }

        return CartResponse.builder()
                .items(items)
                .itemCount(itemCount)
                .subtotal(subtotal.doubleValue())
                .build();
    }
}