package com.store.be_api.review;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.store.be_api.product.Product;
import com.store.be_api.product.ProductRepository;
import com.store.be_api.review.dto.CreateReviewRequest;
import com.store.be_api.review.dto.ReviewDto;
import com.store.be_api.user.User;
import com.store.be_api.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<ReviewDto> getProductReviews(UUID productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto createReview(UUID productId, UUID userId, CreateReviewRequest request) {
        // Validate product exists
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        // Validate user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Validate rating
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        // Create review
        Review review = Review.builder()
            .product(product)
            .user(user)
            .rating(request.getRating())
            .title(request.getTitle())
            .content(request.getContent())
            .createdAt(OffsetDateTime.now())
            .build();

        review = reviewRepository.save(review);

        // Update product rating and review count
        List<Review> allReviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        if (!allReviews.isEmpty()) {
            double avgRating = allReviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);
            product.setRatingAvg(new java.math.BigDecimal(avgRating).setScale(1, java.math.RoundingMode.HALF_UP));
            product.setReviewCount(allReviews.size());
            productRepository.save(product);
        }

        return toDto(review);
    }

    private ReviewDto toDto(Review review) {
        return ReviewDto.builder()
            .id(review.getId())
            .productId(review.getProduct().getId())
            .userId(review.getUser() != null ? review.getUser().getId() : null)
            .userName(review.getUser() != null ? review.getUser().getFullName() : "Anonymous")
            .rating(review.getRating())
            .title(review.getTitle())
            .content(review.getContent())
            .createdAt(review.getCreatedAt() != null
                ? review.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
                : null)
            .build();
    }
}