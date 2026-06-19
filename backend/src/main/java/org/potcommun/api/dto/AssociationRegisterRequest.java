package org.potcommun.api.dto;

import jakarta.validation.constraints.*;

public record AssociationRegisterRequest(

    // Optionnel : le nom officiel sera récupéré depuis le SIRET via l'API data.gouv.fr
    @Size(max = 150)
    String nom,

    @NotBlank(message = "Le SIRET est obligatoire")
    @Pattern(regexp = "\\d{14}", message = "Le SIRET doit contenir exactement 14 chiffres")
    String siret,

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    String email,

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 8, max = 100, message = "Le mot de passe doit contenir entre 8 et 100 caractères")
    String password,

    String description,
    String telephone

) {}
