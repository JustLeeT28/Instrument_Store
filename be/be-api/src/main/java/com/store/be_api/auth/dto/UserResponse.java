package com.store.be_api.auth.dto;

import com.store.be_api.user.User;
import com.store.be_api.user.UserRole;
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

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }
}
