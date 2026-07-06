package com.store.be_api.review;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.store.be_api.review.dto.CreateReviewRequest;
import com.store.be_api.review.dto.ReviewDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public List<ReviewDto> getProductReviews(@PathVariable UUID productId) {
        return reviewService.getProductReviews(productId);
    }

    @PostMapping("/product/{productId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewDto createReview(
        @PathVariable UUID productId,
        @RequestBody CreateReviewRequest request,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "User must be authenticated"
            );
        }

        UUID userId = UUID.fromString(authentication.getName());
        return reviewService.createReview(productId, userId, request);
    }
}