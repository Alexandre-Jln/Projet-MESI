package org.potcommun.domain.service;

import org.potcommun.api.dto.LoginRequest;
import org.potcommun.api.dto.RegisterRequest;
import org.potcommun.api.dto.UserResponse;
import org.potcommun.domain.exception.InvalidCredentialsException;
import org.potcommun.domain.exception.UserAlreadyExistsException;
import org.potcommun.infrastructure.persistence.UserEntity;
import org.potcommun.infrastructure.persistence.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public UserResponse register(RegisterRequest request) {
        String hash = hashEmail(request.email());

        if (repo.findByEmailHash(hash).isPresent()) {
            throw new UserAlreadyExistsException();
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.email());          // stocké chiffré via EmailEncryptionConverter
        user.setEmailHash(hash);                  // stocké en SHA-256 pour les lookups
        user.setPassword(encoder.encode(request.password())); // BCrypt

        UserEntity saved = repo.save(user);
        return new UserResponse(saved.getId(), saved.getEmail());
    }

    public UserResponse login(LoginRequest request) {
        String hash = hashEmail(request.email());

        UserEntity user = repo.findByEmailHash(hash)
                .orElseThrow(InvalidCredentialsException::new);

        if (!encoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        return new UserResponse(user.getId(), user.getEmail());
    }

    /**
     * Calcule SHA-256(lowercase(email)).
     * Utilisé comme clé de recherche en BDD pour contourner le caractère
     * non-déterministe du chiffrement AES-GCM.
     */
    private String hashEmail(String email) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(email.toLowerCase().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 indisponible", e);
        }
    }
}