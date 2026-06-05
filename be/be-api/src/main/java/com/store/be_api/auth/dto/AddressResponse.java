package com.store.be_api.auth.dto;

import com.store.be_api.user.Address;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddressResponse {
    private UUID id;
    private String line1;
    private String city;
    private String ward;
    private boolean defaultAddress;

    public static AddressResponse fromAddress(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .line1(address.getLine1())
                .city(address.getCity())
                .ward(address.getWard())
                .defaultAddress(address.isDefaultAddress())
                .build();
    }
}
