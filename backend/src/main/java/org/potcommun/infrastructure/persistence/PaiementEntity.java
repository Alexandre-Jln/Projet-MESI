package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiement")
public class PaiementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "mode_paiement", nullable = false, length = 150)
    private String modePaiement;

    @Column(nullable = false)
    private LocalDateTime date;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    /** 0=en_attente 1=validé 2=refusé 3=remboursé */
    @Column(nullable = false)
    private Integer status;

    @Column(name = "commande_id")
    private Integer commandeId;

    public Integer getId()            { return id; }
    public String getModePaiement()   { return modePaiement; }
    public LocalDateTime getDate()    { return date; }
    public BigDecimal getMontant()    { return montant; }
    public Integer getStatus()        { return status; }
    public Integer getCommandeId()    { return commandeId; }
}
