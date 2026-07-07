package com.store.be_api.product;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.be_api.product.dto.ProductDto;
import com.store.be_api.product.dto.ProductUpdateRequest;
import java.math.BigDecimal;
import com.store.be_api.review.ReviewService;
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
    private final ReviewService reviewService;

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
    public ProductDto createProduct(ProductUpdateRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required");
        }
        if (request.getPrice() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product price is required");
        }

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = toSlug(request.getName());
        }
        slug = ensureUniqueSlug(slug);

        Product product = Product.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .basePrice(BigDecimal.valueOf(request.getPrice()))
                .stockQty(request.getStockQty() == null ? 0 : request.getStockQty())
                .build();

        if (request.getSpecs() != null) {
            try {
                product.setSpecs(objectMapper.writeValueAsString(request.getSpecs()));
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid specs payload");
            }
        }

        Product savedProduct = productRepository.save(product);
        List<ProductImage> savedImages = saveImages(savedProduct.getId(), request.getImages());
        savedProduct.setImages(new java.util.ArrayList<>(savedImages));
        return toDto(savedProduct);
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
        List<ProductImage> savedImages = saveImages(product.getId(), request.getImages());

        product.setImages(new java.util.ArrayList<>(savedImages));
        return toDto(product);
    }

    private List<ProductImage> saveImages(UUID productId, List<ProductUpdateRequest.ProductImagePayload> payloadImages) {
        if (payloadImages == null || payloadImages.isEmpty()) {
            return List.of();
        }

        List<ProductImage> images = payloadImages.stream()
                .filter(image -> image.getImageUrl() != null && !image.getImageUrl().isBlank())
                .map(image -> ProductImage.builder()
                        .productId(productId)
                        .imageUrl(image.getImageUrl())
                        .isPrimary(Boolean.TRUE.equals(image.getIsPrimary()))
                        .build())
                .toList();

        if (!images.isEmpty() && images.stream().noneMatch(ProductImage::getIsPrimary)) {
            images.get(0).setIsPrimary(true);
        }

        return images.isEmpty() ? List.of() : productImageRepository.saveAll(images);
    }

    private String ensureUniqueSlug(String slug) {
        String base = toSlug(slug);
        String candidate = base;
        int suffix = 2;

        while (productRepository.findBySlug(candidate).isPresent()) {
            candidate = base + "-" + suffix;
            suffix += 1;
        }

        return candidate;
    }

    private String toSlug(String value) {
        String slug = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return slug.isBlank() ? "san-pham" : slug;
    }

    private ProductDto toDto(Product p) {
        List<String> imageUrls = p.getImages() == null
                ? List.of()
                : p.getImages().stream()
                    .filter(image -> image.getImageUrl() != null && !image.getImageUrl().isBlank())
                    .sorted(Comparator.comparing((ProductImage image) -> Boolean.TRUE.equals(image.getIsPrimary())).reversed())
                    .map(ProductImage::getImageUrl)
                    .toList();

        List<Map<String, String>> specsList = List.of();
        try {
            if (p.getSpecs() != null && !p.getSpecs().isBlank()) {
                // Try parsing as Array format first (new format)
                try {
                    specsList = objectMapper.readValue(p.getSpecs(), new TypeReference<List<Map<String, String>>>() {});
                } catch (Exception e) {
                    // If Array parse fails, try Object format (old format) and convert to Array
                    Map<String, String> specsMap = objectMapper.readValue(p.getSpecs(), new TypeReference<Map<String, String>>() {});
                    specsList = specsMap.entrySet().stream()
                        .map(entry -> Map.of("key", entry.getKey(), "value", entry.getValue()))
                        .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            specsList = List.of();
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
                .specs(specsList)
                .reviews(reviewService.getProductReviews(p.getId()))
                .build();
    }
}
