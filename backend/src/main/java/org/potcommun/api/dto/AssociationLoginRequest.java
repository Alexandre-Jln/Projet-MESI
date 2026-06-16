// ── AssociationLoginRequest.java ────────────────────────────
package org.potcommun.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AssociationLoginRequest(
    @NotBlank @Email String email,
    @NotBlank        String password
) {}
