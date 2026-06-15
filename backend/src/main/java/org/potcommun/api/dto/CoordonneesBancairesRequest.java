package org.potcommun.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CoordonneesBancairesRequest(

    @NotBlank(message = "L'IBAN est obligatoire")
    @Pattern(
        regexp = "[A-Z]{2}\\d{2}[A-Z0-9]{1,30}",
        message = "Format IBAN invalide (ex : FR76 3000 6000 0112 3456 7890 189)"
    )
    String iban,

    // Nom du titulaire du compte (optionnel, peut différer du nom de l'asso)
    String titulaire

) {}
