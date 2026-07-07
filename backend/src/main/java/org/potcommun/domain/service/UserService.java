package org.potcommun.domain.service;

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

    private final UserRepository  repo;
    private final PasswordEncoder encoder;
    private final EmailVerificationService emailVerificationService;

    public UserService(UserRepository repo,
                       PasswordEncoder encoder,
                       EmailVerificationService emailVerificationService) {
        this.repo    = repo;
        this.encoder = encoder;
        this.emailVerificationService = emailVerificationService;
    }

    public UserEntity register(String email, String password) {
        String hash = hashEmail(email);
        if (repo.findByEmailHash(hash).isPresent()) {
            throw new UserAlreadyExistsException(email);
        }

        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setEmailHash(hash);
        user.setPassword(encoder.encode(password));
        UserEntity saved = repo.save(user);

        emailVerificationService.sendVerificationEmail(saved, email);

        return saved;
    }

    public UserEntity login(String email, String password) {
        String hash = hashEmail(email);
        UserEntity user = repo.findByEmailHash(hash)
                .orElseThrow(() -> new InvalidCredentialsException("Identifiants invalides"));
        if (!encoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Identifiants invalides");
        }
        return user;
    }

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