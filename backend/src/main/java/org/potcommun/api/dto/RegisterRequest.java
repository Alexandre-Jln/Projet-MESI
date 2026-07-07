package org.potcommun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "L'adresse email est obligatoire")
        @Email(message = "Format d'email invalide")
        @Size(max = 250, message = "L'email ne peut pas dépasser 250 caractères")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, max = 100, message = "Le mot de passe doit contenir entre 8 et 100 caractères")
        String password,

        String captchaToken

) {}