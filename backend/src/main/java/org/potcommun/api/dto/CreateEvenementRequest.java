package org.potcommun.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateEvenementRequest(
    @NotBlank String   name,
    String             synopsis,
    LocalDate          releaseDt,    // nullable pour les brouillons
    Integer            duration,
    @NotNull Integer   associationId,
    Boolean            brouillon     // null traité comme false
) {}