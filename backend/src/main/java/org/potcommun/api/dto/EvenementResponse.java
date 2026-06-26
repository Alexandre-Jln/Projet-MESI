package org.potcommun.api.dto;

import org.potcommun.infrastructure.persistence.EvenementEntity;
import java.time.LocalDate;
import java.util.List;

public record EvenementResponse(
    Integer       id,
    String        name,
    String        synopsis,
    LocalDate     releaseDt,
    Integer       duration,
    Integer       associationId,
    String        associationName,
    String        associationCategorie,
    Long          nombreBillets,
    List<Integer> photoIds,
    boolean       brouillon
) {
    public static EvenementResponse from(EvenementEntity e,
                                         String associationName,
                                         String associationCategorie,
                                         Long nombreBillets,
                                         List<Integer> photoIds) {
        return new EvenementResponse(
            e.getId(), e.getName(), e.getSynopsis(),
            e.getReleaseDt(), e.getDuration(), e.getAssociationId(),
            associationName, associationCategorie, nombreBillets,
            photoIds, e.isBrouillon()
        );
    }
}