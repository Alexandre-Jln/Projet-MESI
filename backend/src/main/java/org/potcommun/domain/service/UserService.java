package org.potcommun.domain.service;

import org.potcommun.domain.exception.InvalidCredentialsException;
import org.potcommun.domain.exception.UserAlreadyExistsException;
import org.potcommun.infrastructure.persistence.UserEntity;
import org.potcommun.infrastructure.persistence.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service métier utilisateur.
 * <p>
 * Correction architecture hexagonale : le domain n'importe plus aucun DTO
 * de la couche api. Le controller est responsable de la conversion DTO ↔ primitifs.
 */
@Service
public class UserService {

    private final UserRepository  repo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo    = repo;
        this.encoder = encoder;
    }

    /**
     * Crée un nouvel utilisateur.
     *
     * @param email    adresse email (unique)
     * @param password mot de passe en clair (sera haché)
     * @return l'entité persistée
     * @throws UserAlreadyExistsException si l'email est déjà utilisé
     */
    public UserEntity register(String email, String password) {
        if (repo.findByEmail(email).isPresent()) {
            throw new UserAlreadyExistsException(email);
        }

        UserEntity user = new UserEntity();
        user.setEmail(email);
        user.setPassword(encoder.encode(password));

        return repo.save(user);
    }

    /**
     * Authentifie un utilisateur.
     *
     * @param email    adresse email
     * @param password mot de passe en clair
     * @return l'entité authentifiée
     * @throws InvalidCredentialsException si les identifiants sont incorrects
     */
    public UserEntity login(String email, String password) {
        UserEntity user = repo.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Identifiants invalides"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Identifiants invalides");
        }

        return user;
    }
}