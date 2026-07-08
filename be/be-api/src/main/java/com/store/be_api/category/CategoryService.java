package com.store.be_api.category;

import com.store.be_api.category.dto.CategoryResponse;
import com.store.be_api.category.dto.CategoryUpsertRequest;
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
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .sorted((a, b) -> Integer.compare(a.getPosition() == null ? 0 : a.getPosition(), b.getPosition() == null ? 0 : b.getPosition()))
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryUpsertRequest request) {
        String name = request.getName().trim();
        categoryRepository.findByNameIgnoreCase(name).ifPresent(category -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        });

        Integer position = request.getPosition();
        if (position == null) {
            position = categoryRepository.findAll().stream()
                    .map(Category::getPosition)
                    .filter(value -> value != null)
                    .max(Integer::compareTo)
                    .orElse(0) + 1;
        }

        Category category = Category.builder()
                .name(name)
                .slug(ensureUniqueSlug(name))
                .position(position)
                .build();

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        try {
            categoryRepository.delete(category);
            categoryRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete a category that is used by products");
        }
    }

    private String ensureUniqueSlug(String value) {
        String base = toSlug(value, "danh-muc");
        String candidate = base;
        int suffix = 2;

        while (categoryRepository.findBySlug(candidate).isPresent()) {
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
