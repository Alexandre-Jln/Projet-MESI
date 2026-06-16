// ── AssociationAlreadyExistsException.java ──────────────────
package org.potcommun.domain.exception;

public class AssociationAlreadyExistsException extends RuntimeException {
    public AssociationAlreadyExistsException(String message) {
        super(message);
    }
}
