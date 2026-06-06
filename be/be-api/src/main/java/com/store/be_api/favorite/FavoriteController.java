package com.store.be_api.favorite;

import com.store.be_api.favorite.dto.FavoriteStatusResponse;
import com.store.be_api.product.dto.ProductDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {
    private final FavoriteService favoriteService;

    @GetMapping
    public List<ProductDto> listFavorites(Authentication authentication) {
        return favoriteService.listFavorites(authentication);
    }

    @GetMapping("/{productId}")
    public FavoriteStatusResponse getStatus(Authentication authentication, @PathVariable UUID productId) {
        return favoriteService.getStatus(authentication, productId);
    }

    @PostMapping("/{productId}")
    public ProductDto addFavorite(Authentication authentication, @PathVariable UUID productId) {
        return favoriteService.addFavorite(authentication, productId);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFavorite(Authentication authentication, @PathVariable UUID productId) {
        favoriteService.removeFavorite(authentication, productId);
        return ResponseEntity.noContent().build();
    }
}
