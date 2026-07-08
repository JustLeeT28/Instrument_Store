package com.store.be_api.brand;

import com.store.be_api.brand.dto.BrandResponse;
import com.store.be_api.brand.dto.BrandUpsertRequest;
import java.text.Normalizer;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandService {
    private final BrandRepository brandRepository;

    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(BrandResponse::fromEntity)
                .toList();
    }

    @Transactional
    public BrandResponse createBrand(BrandUpsertRequest request) {
        String name = request.getName().trim();
        brandRepository.findByNameIgnoreCase(name).ifPresent(brand -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Brand already exists");
        });

        Brand brand = Brand.builder()
                .name(name)
                .slug(ensureUniqueSlug(name))
                .build();

        return BrandResponse.fromEntity(brandRepository.save(brand));
    }

    @Transactional
    public void deleteBrand(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));

        try {
            brandRepository.delete(brand);
            brandRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a brand that is used by products");
        }
    }

    private String ensureUniqueSlug(String value) {
        String base = toSlug(value, "thuong-hieu");
        String candidate = base;
        int suffix = 2;

        while (brandRepository.findBySlug(candidate).isPresent()) {
            candidate = base + "-" + suffix;
            suffix += 1;
        }

        return candidate;
    }

    private String toSlug(String value, String fallback) {
        String slug = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return slug.isBlank() ? fallback : slug;
    }
}
