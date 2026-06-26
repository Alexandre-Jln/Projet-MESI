package org.potcommun.api.dto;

import java.time.LocalDate;

public record AdhesionResponse(
    Integer   id,
    Long      userId,
    String    role,
    LocalDate date,
    String    email,
    String    prenom,
    String    nom
) {}
