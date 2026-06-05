package com.store.be_api.product;

import com.store.be_api.product.dto.ProductDto;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    private static final String PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x800?text=No+Image";

    public List<ProductDto> listAll() {
        return productRepository.findAll().stream().map(this::toDto)
            .collect(Collectors.toList());
    }

    public ProductDto getById(UUID id) {
        Optional<Product> opt = productRepository.findById(id);
        return opt.map(this::toDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private ProductDto toDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .brand(p.getBrand() != null ? p.getBrand().getName() : null)
                .category(p.getCategory() != null ? p.getCategory().getName() : null)
                .price(p.getBasePrice() != null ? p.getBasePrice().doubleValue() : 0.0)
                .rating(p.getRatingAvg() != null ? p.getRatingAvg().doubleValue() : 0.0)
                .reviewCount(p.getReviewCount())
                .badge(p.getBadge())
                .stockQty(p.getStockQty())
                .description(p.getDescription())
                .image(PLACEHOLDER_IMAGE)
                .build();
    }
}
