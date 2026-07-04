package com.store.be_api.product;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.be_api.product.dto.ProductDto;
import com.store.be_api.product.dto.ProductUpdateRequest;
import java.math.BigDecimal;
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
    private final ProductImageRepository productImageRepository;
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

    @Transactional
    public ProductDto updateProduct(UUID id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (request.getName() != null) product.setName(request.getName());
        if (request.getSlug() != null) product.setSlug(request.getSlug());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setBasePrice(BigDecimal.valueOf(request.getPrice()));
        if (request.getStockQty() != null) product.setStockQty(request.getStockQty());

        if (request.getSpecs() != null) {
            try {
                product.setSpecs(objectMapper.writeValueAsString(request.getSpecs()));
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid specs payload");
            }
        }

        productRepository.save(product);

        productImageRepository.deleteByProductId(product.getId());
        List<ProductImage> savedImages = List.of();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<ProductImage> images = request.getImages().stream()
                    .filter(image -> image.getImageUrl() != null && !image.getImageUrl().isBlank())
                    .map(image -> ProductImage.builder()
                            .productId(product.getId())
                            .imageUrl(image.getImageUrl())
                            .isPrimary(Boolean.TRUE.equals(image.getIsPrimary()))
                            .build())
                    .toList();

            if (!images.isEmpty() && images.stream().noneMatch(ProductImage::getIsPrimary)) {
                images.get(0).setIsPrimary(true);
            }
            savedImages = productImageRepository.saveAll(images);
        }

        product.setImages(new java.util.ArrayList<>(savedImages));
        return toDto(product);
    }

    private ProductDto toDto(Product p) {
        List<String> imageUrls = p.getImages() == null
                ? List.of()
                : p.getImages().stream()
                    .filter(image -> image.getImageUrl() != null && !image.getImageUrl().isBlank())
                    .sorted(Comparator.comparing((ProductImage image) -> Boolean.TRUE.equals(image.getIsPrimary())).reversed())
                    .map(ProductImage::getImageUrl)
                    .toList();

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
                .image(imageUrls.isEmpty() ? PLACEHOLDER_IMAGE : imageUrls.get(0))
                .images(imageUrls)
                .specs(specsMap)
                .build();
    }
}
