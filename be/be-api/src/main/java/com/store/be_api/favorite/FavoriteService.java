package com.store.be_api.favorite;

import com.store.be_api.favorite.dto.FavoriteStatusResponse;
import com.store.be_api.product.Product;
import com.store.be_api.product.ProductRepository;
import com.store.be_api.product.ProductService;
import com.store.be_api.product.dto.ProductDto;
import com.store.be_api.user.User;
import com.store.be_api.user.UserRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProductDto> listFavorites(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);

        return favoriteRepository.findByUserOrderByIdDesc(user).stream()
                .map(favorite -> productService.getById(favorite.getProduct().getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public FavoriteStatusResponse getStatus(Authentication authentication, UUID productId) {
        User user = getAuthenticatedUser(authentication);
        Product product = getProduct(productId);

        return new FavoriteStatusResponse(favoriteRepository.existsByUserAndProduct(user, product));
    }

    @Transactional
    public ProductDto addFavorite(Authentication authentication, UUID productId) {
        User user = getAuthenticatedUser(authentication);
        Product product = getProduct(productId);

        favoriteRepository.findByUserAndProduct(user, product)
                .orElseGet(() -> favoriteRepository.save(Favorite.builder()
                        .user(user)
                        .product(product)
                        .build()));

        return productService.getById(productId);
    }

    @Transactional
    public void removeFavorite(Authentication authentication, UUID productId) {
        User user = getAuthenticatedUser(authentication);
        Product product = getProduct(productId);

        favoriteRepository.findByUserAndProduct(user, product)
                .ifPresent(favoriteRepository::delete);
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
}
