package com.store.be_api.user.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Email
    private String email;

    private String fullName;

    private String phone;

    private AddressInput address;

    @Data
    public static class AddressInput {
        private String line1;
        private String city;
        private String ward;
        private Boolean defaultAddress;
    }
}
