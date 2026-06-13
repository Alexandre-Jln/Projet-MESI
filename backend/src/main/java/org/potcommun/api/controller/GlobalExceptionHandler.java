package org.potcommun.api.controller;

import org.potcommun.domain.exception.InvalidCredentialsException;
import org.potcommun.domain.exception.UserAlreadyExistsException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralise la gestion des erreurs pour tous les controllers.
 * Transforme les exceptions en réponses JSON structurées.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Validation Bean Validation échouée (@NotBlank, @Email, @Size…).
     * Retourne un 400 avec la liste des champs invalides et leur message d'erreur.
     *
     * Exemple de réponse :
     * {
     *   "errors": {
     *     "email": "Format d'email invalide",
     *     "password": "Le mot de passe doit contenir entre 8 et 100 caractères"
     *   }
     * }
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(err -> fieldErrors.put(err.getField(), err.getDefaultMessage()));

        Map<String, Object> body = new HashMap<>();
        body.put("errors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserExists(UserAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Un compte existe déjà avec cet email."));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Email ou mot de passe incorrect."));
    }
}