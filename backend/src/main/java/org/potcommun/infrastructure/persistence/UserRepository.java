package org.potcommun.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    /**
     * Recherche un utilisateur par le hash SHA-256 de son email.
     * On ne cherche jamais par l'email chiffré (AES-GCM est non-déterministe).
     * Le hash est calculé dans UserService avant l'appel à cette méthode.
     */
    Optional<UserEntity> findByEmailHash(String emailHash);
}