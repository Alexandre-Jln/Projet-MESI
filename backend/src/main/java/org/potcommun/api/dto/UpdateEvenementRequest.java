package org.potcommun.api.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record UpdateEvenementRequest(
    @NotBlank String name,
    String            synopsis,
    LocalDate         releaseDt,
    Integer           duration,
    Boolean           brouillon
) {}
