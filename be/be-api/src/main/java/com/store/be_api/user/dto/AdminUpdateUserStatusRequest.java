package com.store.be_api.user.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUpdateUserStatusRequest {
    @NotNull
    private Boolean status;
}
