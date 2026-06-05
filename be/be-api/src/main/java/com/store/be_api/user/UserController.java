package com.store.be_api.user;

import com.store.be_api.auth.dto.UserResponse;
import com.store.be_api.auth.dto.AddressResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
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
}
