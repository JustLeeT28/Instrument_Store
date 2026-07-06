package com.store.be_api.review.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDto {
    private UUID id;
    private UUID productId;
    private UUID userId;
    private String userName;
    private Integer rating;
    private String title;
    private String content;
    private String createdAt;
}