package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "association")
public class AssociationEntity {

    public enum Statut { PENDING, VALIDATED, REJECTED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 250)
    private String categorie;

    /** Email de contact public (non chiffré — donnée publique pour une association). */
    @Column(nullable = false, unique = true, length = 250)
    private String email;

    /** SHA-256(lowercase(email)) pour les lookups d'authentification. */
    @Column(name = "email_hash", length = 64)
    private String emailHash;

    /** Mot de passe BCrypt du compte association. Null pour les assos pré-créées. */
    @Column(name = "password_hash")
    private String passwordHash;

    @Column(unique = true)
    @Column(unique = true, length = 250)
    private String siret;

    @Column(name = "siege_social", length = 250)
    private String siegeSocial;

    @Column(length = 20)
    private String telephone;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * IBAN ou identifiant bancaire pour recevoir les virements Stripe Connect.
     * Obligatoire avant de pouvoir créer une cagnotte.
     */
    private String iban;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;
    /**
     * Statut du compte association :
     *  PENDING   → inscription reçue, en attente de validation admin
     *  VALIDATED → compte validé, peut créer des cagnottes
     *  REJECTED  → inscription rejetée
     *
     * Les associations pré-créées dans init.sql ont VALIDATED par défaut.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.PENDING;

    @Column(name = "date_inscription")
    private LocalDateTime dateInscription;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "motif_rejet")
    private String motifRejet;

    // ── Getters / Setters ────────────────────────────────────────────────

    public Integer getId()                   { return id; }

    public String getName()                  { return name; }
    public void   setName(String name)       { this.name = name; }

    public String getCategorie()                    { return categorie; }
    public void   setCategorie(String categorie)    { this.categorie = categorie; }

    public String getEmail()                 { return email; }
    public void   setEmail(String email)     { this.email = email; }

    public String getEmailHash()                    { return emailHash; }
    public void   setEmailHash(String emailHash)    { this.emailHash = emailHash; }

    public String getPasswordHash()                       { return passwordHash; }
    public void   setPasswordHash(String passwordHash)    { this.passwordHash = passwordHash; }

    public String getSiret()                 { return siret; }
    public void   setSiret(String siret)     { this.siret = siret; }

    public String getSiegeSocial()                        { return siegeSocial; }
    public void   setSiegeSocial(String siegeSocial)      { this.siegeSocial = siegeSocial; }

    public String getTelephone()                    { return telephone; }
    public void   setTelephone(String telephone)    { this.telephone = telephone; }

    public String getDescription()                        { return description; }
    public void   setDescription(String description)      { this.description = description; }

    public String getIban()                  { return iban; }
    public void   setIban(String iban)       { this.iban = iban; }

    public Statut getStatut()                { return statut; }
    public void   setStatut(Statut statut)   { this.statut = statut; }

    public LocalDateTime getDateInscription()                             { return dateInscription; }
    public void          setDateInscription(LocalDateTime dateInscription){ this.dateInscription = dateInscription; }

    public LocalDateTime getDateValidation()                              { return dateValidation; }
    public void          setDateValidation(LocalDateTime dateValidation)  { this.dateValidation = dateValidation; }

    public String getMotifRejet()                       { return motifRejet; }
    public void   setMotifRejet(String motifRejet)      { this.motifRejet = motifRejet; }

    public BigDecimal getLatitude()   { return latitude; }
    public BigDecimal getLongitude()  { return longitude; }
}