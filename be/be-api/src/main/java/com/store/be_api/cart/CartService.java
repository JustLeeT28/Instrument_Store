package com.store.be_api.cart;

import com.store.be_api.cart.dto.CartItemResponse;
import com.store.be_api.cart.dto.CartResponse;
import com.store.be_api.product.ProductRepository;
import com.store.be_api.product.ProductService;
import com.store.be_api.product.dto.ProductDto;
import jakarta.servlet.http.HttpSession;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CartService {
    private static final String CART_SESSION_KEY = CartService.class.getName() + ".CART";

    private final ProductRepository productRepository;
    private final ProductService productService;

    public CartResponse getCart(HttpSession session) {
        return buildResponse(getCartMap(session, false));
    }

    public CartResponse addItem(HttpSession session, UUID productId, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than 0");
        }

        Map<UUID, Integer> cart = getCartMap(session, true);
        cart.merge(productId, quantity, Integer::sum);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildResponse(cart);
    }

    public CartResponse updateItem(HttpSession session, UUID productId, int quantity) {
        Map<UUID, Integer> cart = getCartMap(session, true);
        if (quantity <= 0) {
            cart.remove(productId);
        } else {
            cart.put(productId, quantity);
        }
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildResponse(cart);
    }

    public CartResponse removeItem(HttpSession session, UUID productId) {
        Map<UUID, Integer> cart = getCartMap(session, true);
        cart.remove(productId);
        session.setAttribute(CART_SESSION_KEY, cart);
        return buildResponse(cart);
    }

    public void clearCart(HttpSession session) {
        session.removeAttribute(CART_SESSION_KEY);
    }

    @SuppressWarnings("unchecked")
    private Map<UUID, Integer> getCartMap(HttpSession session, boolean createIfMissing) {
        Object existing = session.getAttribute(CART_SESSION_KEY);
        if (existing instanceof Map<?, ?> map) {
            return (Map<UUID, Integer>) map;
        }

        if (!createIfMissing) {
            return new LinkedHashMap<>();
        }

        Map<UUID, Integer> cart = new LinkedHashMap<>();
        session.setAttribute(CART_SESSION_KEY, cart);
        return cart;
    }

    private CartResponse buildResponse(Map<UUID, Integer> cart) {
        List<CartItemResponse> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int itemCount = 0;

        for (Map.Entry<UUID, Integer> entry : cart.entrySet()) {
            ProductDto product = getProduct(entry.getKey());
            int quantity = entry.getValue() == null ? 0 : entry.getValue();
            if (quantity <= 0) {
                continue;
            }

            BigDecimal lineTotal = BigDecimal.valueOf(product.getPrice()).multiply(BigDecimal.valueOf(quantity));
            subtotal = subtotal.add(lineTotal);
            itemCount += quantity;

            items.add(CartItemResponse.builder()
                    .product(product)
                    .quantity(quantity)
                    .lineTotal(lineTotal.doubleValue())
                    .build());
        }

        return CartResponse.builder()
                .items(items)
                .itemCount(itemCount)
                .subtotal(subtotal.doubleValue())
                .build();
    }

    private ProductDto getProduct(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }

        return productService.getById(productId);
    }
}
