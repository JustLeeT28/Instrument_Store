package com.store.be_api.auth.dto;

import com.store.be_api.user.User;
import com.store.be_api.user.UserRole;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private boolean status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private AddressResponse defaultAddress;

    public static UserResponse fromUser(User user, AddressResponse defaultAddress) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.isStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .defaultAddress(defaultAddress)
                .build();
    }
}
