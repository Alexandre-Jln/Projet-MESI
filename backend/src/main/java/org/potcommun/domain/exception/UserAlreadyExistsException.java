package org.potcommun.domain.exception;

public class UserAlreadyExistsException extends RuntimeException {

    // Constructeur sans arg — utilisé dans la version originale
    public UserAlreadyExistsException() {
        super("Un compte existe déjà avec cet email.");
    }

    // Constructeur avec message — ajouté depuis develop
    public UserAlreadyExistsException(String email) {
        super("Un compte existe déjà avec l'adresse : " + email);
    }
}
