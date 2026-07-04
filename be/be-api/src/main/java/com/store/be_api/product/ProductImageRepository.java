package com.store.be_api.product;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    @Modifying
    @Query("delete from ProductImage pi where pi.productId = :productId")
    void deleteByProductId(@Param("productId") UUID productId);
}
