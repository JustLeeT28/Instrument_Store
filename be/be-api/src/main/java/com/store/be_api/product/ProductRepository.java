package com.store.be_api.product;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, UUID> {
	@Override
	@EntityGraph(attributePaths = {"brand", "category", "images"})
	java.util.List<Product> findAll();

	@Override
	@EntityGraph(attributePaths = {"brand", "category", "images"})
	Optional<Product> findById(UUID id);

	@EntityGraph(attributePaths = {"brand", "category", "images"})
	Optional<Product> findBySlug(String slug);

}
