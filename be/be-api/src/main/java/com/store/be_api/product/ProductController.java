package com.store.be_api.product;

import com.store.be_api.product.dto.ProductDto;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/products", "/products"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public List<ProductDto> list() {
        return productService.listAll();
    }

    @GetMapping("/{id}")
    public ProductDto get(@PathVariable UUID id) {
        return productService.getById(id);
    }

    @GetMapping("/slug/{slug}")
    public ProductDto getBySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }
}
