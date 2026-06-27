// ── SiretInvalidException.java ──────────────────────────────
package org.potcommun.domain.exception;

public class SiretInvalidException extends RuntimeException {
    public SiretInvalidException(String message) {
        super(message);
    }
}
