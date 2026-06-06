package org.potcommun.infrastructure.mapper;

import org.potcommun.api.dto.UserResponse;
import org.potcommun.infrastructure.persistence.UserEntity;
import org.springframework.stereotype.Component;

/**
 * Convertit les entités de persistance vers les DTOs exposés par l'API.
 * Centralise le mapping pour décharger le service et le contrôleur.
 */
@Component
public class UserMapper {

    /**
     * Convertit un {@link UserEntity} en {@link UserResponse}.
     *
     * @param entity l'entité à convertir (non null)
     * @return le DTO correspondant
     */
    public UserResponse toResponse(UserEntity entity) {
        return new UserResponse(entity.getId(), entity.getEmail());
    }
}