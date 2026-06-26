package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;

@Entity
@Table(name = "commande")
public class CommandeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "evenement_id", nullable = false)
    private Integer evenementId;

    public Integer getId()          { return id; }
    public Long getUserId()         { return userId; }
    public Integer getEvenementId() { return evenementId; }
}
