// ── CagnotteResponse.java ───────────────────────────────────
package org.potcommun.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record CagnotteResponse(
        Long id,
        String titre,
        String description,
        BigDecimal objectif,
        BigDecimal montantCollecte,
        Integer associationId,
        LocalDateTime dateCreation,
        LocalDate dateFin,
        boolean actif
) {}

// ── DonStripeRequest.java ───────────────────────────────────
// (second record in same compilation unit – or split into two files)
// Pour garder la lisibilité on le met dans son propre fichier.
