package org.potcommun.domain.service;

import org.potcommun.api.dto.LoginRequest;
import org.potcommun.api.dto.RegisterRequest;
import org.potcommun.api.dto.UserResponse;
import org.potcommun.infrastructure.persistence.UserEntity;
import org.potcommun.infrastructure.persistence.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.potcommun.domain.exception.UserAlreadyExistsException;
import org.potcommun.domain.exception.InvalidCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public UserResponse register(RegisterRequest request) {
        if (repo.findByEmail(request.email()).isPresent()) {
            throw new UserAlreadyExistsException();
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setPassword(encoder.encode(request.password()));

        UserEntity saved = repo.save(user);
        return new UserResponse(saved.getId(), saved.getEmail());
    }

    public UserResponse login(LoginRequest request) {
        UserEntity user = repo.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!encoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return new UserResponse(user.getId(), user.getEmail());
    }
}

