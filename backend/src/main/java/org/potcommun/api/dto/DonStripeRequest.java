package org.potcommun.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DonStripeRequest(

        @NotNull(message = "Le montant est obligatoire")
        @DecimalMin(value = "1.00", message = "Le don minimum est de 1 €")
        BigDecimal montant

) {}
