package org.potcommun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank(message = "L'adresse email est obligatoire")
        @Email(message = "Format d'email invalide")
        @Size(max = 250, message = "L'email ne peut pas dépasser 250 caractères")
        String email,

        // Optionnel : laisser vide pour ne pas changer le mot de passe
        String password

) {}
