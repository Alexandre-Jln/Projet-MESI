package org.potcommun.infrastructure.mapper;

import org.potcommun.api.dto.UserResponse;
import org.potcommun.infrastructure.persistence.UserEntity;
import org.springframework.stereotype.Component;

/**
 * Convertit les entités de persistance vers les DTOs exposés par l'API.
 * Ajouté depuis develop (architecture hexagonale).
 */
@Component
public class UserMapper {

    public UserResponse toResponse(UserEntity entity) {
        return new UserResponse(entity.getId(), entity.getEmail());
    }
}
