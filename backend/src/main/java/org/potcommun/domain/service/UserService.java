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
import java.util.NoSuchElementException;

/**
 * Service métier utilisateur.
 *
 * Architecture hexagonale (develop) : le service prend des primitives, pas des DTOs.
 * Sécurité (ta branche) : l'email est hashé en SHA-256 pour les lookups,
 * et chiffré en AES-256-GCM en base via EmailEncryptionConverter.
 */
@Service
public class UserService {

    private final UserRepository  repo;
    private final PasswordEncoder encoder;
    private final EmailVerificationService emailVerificationService;

    public UserService(UserRepository repo, PasswordEncoder encoder,
                       EmailVerificationService emailVerificationService) {
        this.repo    = repo;
        this.encoder = encoder;
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Crée un nouvel utilisateur.
     * Signature develop (primitives) + hashing de ta branche.
     */
    public UserEntity register(String email, String password) {
        String hash = hashEmail(email);

        if (repo.findByEmailHash(hash).isPresent()) {
            throw new UserAlreadyExistsException(email);
        }

        UserEntity user = new UserEntity();
        user.setEmail(email);                        // chiffré via EmailEncryptionConverter
        user.setEmailHash(hash);                     // SHA-256 pour les lookups
        user.setPassword(encoder.encode(password));  // BCrypt

        UserEntity saved = repo.save(user);

        try {
            emailVerificationService.sendVerificationEmail(saved, email);
        } catch (Exception e) {
            // SMTP non configuré (démo) : on n'empêche pas l'inscription.
        }

        return saved;
    }

    /**
     * Authentifie un utilisateur.
     * Signature develop (primitives) + lookup par hash de ta branche.
     */
    public UserEntity login(String email, String password) {
        String hash = hashEmail(email);

        UserEntity user = repo.findByEmailHash(hash)
                .orElseThrow(() -> new InvalidCredentialsException("Identifiants invalides"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Identifiants invalides");
        }

        return user;
    }

    /**
     * Met à jour l'email et/ou le mot de passe d'un utilisateur (onglet Paramètres).
     * Le mot de passe n'est changé que si non-vide.
     */
    public UserEntity updateProfile(Long id, String email, String password) {
        UserEntity user = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Utilisateur introuvable."));

        String hash = hashEmail(email);
        if (!hash.equals(user.getEmailHash())) {
            if (repo.findByEmailHash(hash).isPresent()) {
                throw new UserAlreadyExistsException(email);
            }
            user.setEmail(email);
            user.setEmailHash(hash);
        }

        if (password != null && !password.isBlank()) {
            user.setPassword(encoder.encode(password));
        }

        return repo.save(user);
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
