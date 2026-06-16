package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cagnotte")
public class CagnotteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Objectif de collecte en euros (peut être null = pas de plafond). */
    @Column(precision = 10, scale = 2)
    private BigDecimal objectif;

    /** Montant déjà collecté, mis à jour à chaque don confirmé. */
    @Column(name = "montant_collecte", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantCollecte = BigDecimal.ZERO;

    /** Association bénéficiaire. */
    @Column(name = "association_id", nullable = false)
    private Integer associationId;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    /** Date de fin de la collecte (null = pas de limite). */
    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(nullable = false)
    private boolean actif = true;

    // --- Getters / Setters ---

    public Long getId() { return id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getObjectif() { return objectif; }
    public void setObjectif(BigDecimal objectif) { this.objectif = objectif; }

    public BigDecimal getMontantCollecte() { return montantCollecte; }
    public void setMontantCollecte(BigDecimal montantCollecte) { this.montantCollecte = montantCollecte; }

    public Integer getAssociationId() { return associationId; }
    public void setAssociationId(Integer associationId) { this.associationId = associationId; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    public boolean isActif() { return actif; }
    public void setActif(boolean actif) { this.actif = actif; }
}
