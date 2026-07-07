package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;

/**
 * Entité JPA mappée sur la table "users".
 *
 * Stratégie de sécurité des emails :
 *  - email      : chiffré en AES-256-GCM via EmailEncryptionConverter (lisible par l'appli)
 *  - email_hash : SHA-256 de l'email en minuscules, stocké en clair pour les recherches SQL.
 *                 Un hash SHA-256 est non-réversible : on ne peut pas retrouver l'email depuis la BDD.
 *
 * Pourquoi deux colonnes ?
 *  AES-GCM utilise un IV aléatoire → le même email chiffré deux fois donne deux valeurs différentes.
 *  On ne peut donc pas faire "WHERE email = ?" avec la valeur chiffrée.
 *  Le hash résout ce problème : on hache l'email en clair côté Java, puis on cherche le hash en BDD.
 */
@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Email chiffré. Le convertisseur est appliqué automatiquement par JPA. */
    @Convert(converter = EmailEncryptionConverter.class)
    @Column(nullable = false)
    private String email;

    /**
     * SHA-256(lowercase(email)) – utilisé pour les lookups (findByEmailHash).
     * Colonne UNIQUE : garantit qu'un même email ne peut pas être inscrit deux fois.
     */
    @Column(name = "email_hash", unique = true, nullable = false, length = 64)
    private String emailHash;

    /** Mot de passe haché en BCrypt (jamais stocké en clair). */
    @Column(nullable = false)
    private String password;

    /**
     * Indique si l'utilisateur a confirmé son adresse email.
     * Valeur par défaut à false : un compte est non vérifié tant que
     * le lien/code de confirmation n'a pas été validé.
     */
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    // --- Getters / Setters ---

    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEmailHash() { return emailHash; }
    public void setEmailHash(String emailHash) { this.emailHash = emailHash; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
}