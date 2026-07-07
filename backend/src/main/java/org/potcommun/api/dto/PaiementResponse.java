package org.potcommun.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaiementResponse(
    Integer       id,
    String        modePaiement,
    LocalDateTime date,
    BigDecimal    montant,
    Integer       status,
    String        evenementNom
) {}
