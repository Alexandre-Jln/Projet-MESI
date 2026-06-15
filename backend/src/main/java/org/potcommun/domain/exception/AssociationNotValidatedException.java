// ── AssociationNotValidatedException.java ───────────────────
package org.potcommun.domain.exception;

public class AssociationNotValidatedException extends RuntimeException {
    public AssociationNotValidatedException(String message) {
        super(message);
    }
}
