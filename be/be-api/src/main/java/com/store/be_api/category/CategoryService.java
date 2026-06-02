package com.store.be_api.category;

import com.store.be_api.category.dto.CategoryResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
