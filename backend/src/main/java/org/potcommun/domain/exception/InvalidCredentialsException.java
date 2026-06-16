package org.potcommun.domain.exception;

public class InvalidCredentialsException extends RuntimeException {

    // Constructeur sans arg — pour compatibilité avec le code existant
    public InvalidCredentialsException() {
        super("Identifiants invalides.");
    }

    // Constructeur avec message — ajouté depuis develop
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
