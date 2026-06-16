// ── CreateCagnotteRequest.java ──────────────────────────────
package org.potcommun.api.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCagnotteRequest(

        @NotBlank(message = "Le titre est obligatoire")
        @Size(max = 150, message = "Le titre ne peut pas dépasser 150 caractères")
        String titre,

        String description,

        @DecimalMin(value = "1.00", message = "L'objectif doit être d'au moins 1 €")
        BigDecimal objectif,

        @NotNull(message = "L'association est obligatoire")
        Integer associationId,

        LocalDate dateFin

) {}
