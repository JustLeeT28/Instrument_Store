package com.store.be_api.user.dto;

import com.store.be_api.user.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateUserRoleRequest {
    @NotNull
    private UserRole role;
}
