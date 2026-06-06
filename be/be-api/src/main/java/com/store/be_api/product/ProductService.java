package com.store.be_api.product;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.be_api.product.dto.ProductDto;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    private static final String PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x800?text=No+Image";

    public List<ProductDto> listAll() {
        return productRepository.findAll().stream().map(this::toDto)
            .collect(Collectors.toList());
    }

    public List<ProductDto> searchProducts(String search, List<String> brands, List<String> categories, Double minPrice, Double maxPrice, String sort) {
        // Logic lọc tại Backend: Lấy tất cả và lọc bằng Stream (Cần tối ưu ở Repository sau này)
        var stream = productRepository.findAll().stream()
            .filter(p -> (search == null || search.isBlank() || p.getName().toLowerCase().contains(search.toLowerCase())))
            .filter(p -> (brands == null || brands.isEmpty() || (p.getBrand() != null && brands.contains(p.getBrand().getName()))))
            .filter(p -> (categories == null || categories.isEmpty() || (p.getCategory() != null && categories.contains(p.getCategory().getName()))))
            .filter(p -> (minPrice == null || (p.getBasePrice() != null && p.getBasePrice().doubleValue() >= minPrice)))
            .filter(p -> (maxPrice == null || (p.getBasePrice() != null && p.getBasePrice().doubleValue() <= maxPrice)));

        if ("price-asc".equals(sort)) {
            stream = stream.sorted(Comparator.comparing(p -> p.getBasePrice().doubleValue()));
        } else if ("price-desc".equals(sort)) {
            stream = stream.sorted(Comparator.comparing((Product p) -> p.getBasePrice().doubleValue()).reversed());
        }

        return stream.map(this::toDto)
            .collect(Collectors.toList());
    }

    public ProductDto getById(UUID id) {
        Optional<Product> opt = productRepository.findById(id);
        return opt.map(this::toDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public ProductDto getBySlug(String slug) {
        Optional<Product> opt = productRepository.findBySlug(slug);
        return opt.map(this::toDto)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private ProductDto toDto(Product p) {
        Map<String, Object> specsMap = null;
        try {
            if (p.getSpecs() != null) {
                specsMap = objectMapper.readValue(p.getSpecs(), new TypeReference<Map<String, Object>>() {});
            }
        } catch (Exception e) {
            specsMap = Map.of();
        }

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
                .specs(specsMap)
                .build();
    }
}
