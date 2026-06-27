package org.potcommun.infrastructure.persistence;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Convertisseur JPA transparent : chiffre l'email avant écriture en BDD,
 * le déchiffre à la lecture.
 *
 * Algorithme : AES-256-GCM (authentifié, non-déterministe grâce à l'IV aléatoire).
 * Format stocké en BDD : "<base64(IV)>:<base64(ciphertext+tag)>"
 *
 * Rétrocompatibilité : si la valeur en BDD ne contient pas de ":", elle est
 * retournée telle quelle (permet de migrer des données existantes en clair).
 */
@Component
@Converter
public class EmailEncryptionConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM    = "AES/GCM/NoPadding";
    private static final int    IV_LENGTH    = 12;   // 96 bits, recommandé pour GCM
    private static final int    TAG_BITS     = 128;  // tag d'authentification GCM

    // Clé AES-256 encodée en Base64 (32 octets → 256 bits).
    // Injectée depuis la variable d'environnement APP_ENCRYPTION_KEY.
    @Value("${app.encryption.key}")
    private String encryptionKeyBase64;

    private SecretKey getSecretKey() {
        byte[] keyBytes = Base64.getDecoder().decode(encryptionKeyBase64);
        if (keyBytes.length != 32) {
            throw new IllegalStateException(
                    "APP_ENCRYPTION_KEY doit être une clé Base64 de 32 octets (AES-256). " +
                            "Génère-en une avec : openssl rand -base64 32"
            );
        }
        return new SecretKeySpec(keyBytes, "AES");
    }

    /** Chiffre l'email → valeur stockée en BDD. */
    @Override
    public String convertToDatabaseColumn(String plainEmail) {
        if (plainEmail == null) return null;
        try {
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(), new GCMParameterSpec(TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(plainEmail.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(iv)
                    + ":"
                    + Base64.getEncoder().encodeToString(encrypted);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du chiffrement de l'email", e);
        }
    }

    /** Déchiffre la valeur BDD → email en clair pour l'application. */
    @Override
    public String convertToEntityAttribute(String dbValue) {
        if (dbValue == null) return null;

        // Rétrocompatibilité : valeur en clair (pas encore chiffrée) → on la retourne telle quelle
        if (!dbValue.contains(":")) return dbValue;

        try {
            String[] parts    = dbValue.split(":", 2);
            byte[]   iv       = Base64.getDecoder().decode(parts[0]);
            byte[]   encrypted = Base64.getDecoder().decode(parts[1]);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, getSecretKey(), new GCMParameterSpec(TAG_BITS, iv));
            byte[] decrypted = cipher.doFinal(encrypted);

            return new String(decrypted, StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du déchiffrement de l'email", e);
        }
    }
}