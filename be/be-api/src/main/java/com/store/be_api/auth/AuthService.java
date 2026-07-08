package com.store.be_api.auth;

import com.store.be_api.auth.dto.AuthResponse;
import com.store.be_api.auth.dto.AddressResponse;
import com.store.be_api.auth.dto.CheckEmailResponse;
import com.store.be_api.auth.dto.LoginRequest;
import com.store.be_api.auth.dto.RegisterRequest;
import com.store.be_api.auth.dto.UserResponse;
import com.store.be_api.user.User;
import com.store.be_api.user.UserRepository;
import com.store.be_api.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.CUSTOMER)
                .status(true)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(savedUser, null))
                .build();
    }

    public CheckEmailResponse checkEmail(String email) {
        if (email == null || email.isBlank()) {
            return new CheckEmailResponse(false);
        }
        boolean exists = userRepository.existsByEmail(email.trim().toLowerCase());
        return new CheckEmailResponse(exists);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }

        String token = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.fromUser(user, null))
                .build();
    }
}
