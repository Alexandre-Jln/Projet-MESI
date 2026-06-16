// ── AssociationResponse.java ─────────────────────────────────
package org.potcommun.api.dto;

import org.potcommun.infrastructure.persistence.AssociationEntity;
import java.time.LocalDateTime;

public record AssociationResponse(
    Integer       id,
    String        nom,
    String        email,
    String        siret,
    String        categorie,
    String        description,
    String        telephone,
    String        siegeSocial,
    boolean       ibanEnregistre,
    String        statut,
    LocalDateTime dateInscription,
    LocalDateTime dateValidation,
    String        motifRejet
) {
    /** Construit la réponse depuis l'entité JPA. */
    public static AssociationResponse from(AssociationEntity e) {
        return new AssociationResponse(
            e.getId(),
            e.getName(),
            e.getEmail(),
            e.getSiret(),
            e.getCategorie(),
            e.getDescription(),
            e.getTelephone(),
            e.getSiegeSocial(),
            e.getIban() != null && !e.getIban().isBlank(),
            e.getStatut().name(),
            e.getDateInscription(),
            e.getDateValidation(),
            e.getMotifRejet()
        );
    }
}
