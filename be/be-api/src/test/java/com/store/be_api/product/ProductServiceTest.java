package com.store.be_api.product;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.store.be_api.product.dto.ProductUpdateRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductImageRepository productImageRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ProductService productService;

    @Test
    void updateProductShouldReplaceImagesAndSaveSpecs() throws Exception {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder()
                .id(productId)
                .name("Old Name")
                .slug("old-slug")
                .basePrice(new BigDecimal("1000"))
                .stockQty(5)
                .specs("{}")
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productImageRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"material\":\"wood\"}");

        ProductUpdateRequest request = ProductUpdateRequest.builder()
                .name("New Name")
                .slug("new-slug")
                .price(2000.0)
                .stockQty(10)
                .description("Great instrument")
                .images(List.of(
                        ProductUpdateRequest.ProductImagePayload.builder().imageUrl("https://cdn.test/1.jpg").isPrimary(true).build()
                ))
                .specs(List.of(java.util.Map.of("key", "material", "value", "wood")))
                .build();

        var updated = productService.updateProduct(productId, request);

        assertThat(updated.getName()).isEqualTo("New Name");
        assertThat(updated.getImages()).containsExactly("https://cdn.test/1.jpg");
        verify(productImageRepository).deleteByProductId(productId);
        verify(productImageRepository).saveAll(any());
    }
}
