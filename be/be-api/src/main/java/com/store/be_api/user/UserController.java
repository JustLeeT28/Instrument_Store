package com.store.be_api.user;

import com.store.be_api.auth.dto.UserResponse;
import com.store.be_api.auth.dto.AddressResponse;
import com.store.be_api.user.dto.UpdateUserRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        AddressResponse defaultAddress = addressRepository
                .findFirstByUserIdAndDefaultAddressTrueOrderByUpdatedAtDescCreatedAtDesc(user.getId())
                .or(() -> addressRepository.findFirstByUserIdOrderByUpdatedAtDescCreatedAtDesc(user.getId()))
                .map(AddressResponse::fromAddress)
                .orElse(null);

        return UserResponse.fromUser(
                user,
                defaultAddress
        );
    }

    @PutMapping("/me")
    public UserResponse updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized"));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        User savedUser = userRepository.save(user);

        if (request.getAddress() != null) {
            UpdateUserRequest.AddressInput addressInput = request.getAddress();
            Address address = addressRepository
                    .findFirstByUserIdOrderByUpdatedAtDescCreatedAtDesc(savedUser.getId())
                    .orElseGet(() -> Address.builder()
                            .userId(savedUser.getId())
                            .createdAt(OffsetDateTime.now())
                            .build());

            if (addressInput.getLine1() != null) {
                address.setLine1(addressInput.getLine1());
            }
            if (addressInput.getCity() != null) {
                address.setCity(addressInput.getCity());
            }
            if (addressInput.getWard() != null) {
                address.setWard(addressInput.getWard());
            }
            if (addressInput.getDefaultAddress() != null) {
                address.setDefaultAddress(addressInput.getDefaultAddress());
            }

            addressRepository.save(address);
        }

        AddressResponse defaultAddress = addressRepository
                .findFirstByUserIdAndDefaultAddressTrueOrderByUpdatedAtDescCreatedAtDesc(savedUser.getId())
                .or(() -> addressRepository.findFirstByUserIdOrderByUpdatedAtDescCreatedAtDesc(savedUser.getId()))
                .map(AddressResponse::fromAddress)
                .orElse(null);

        return UserResponse.fromUser(savedUser, defaultAddress);
    }
}
