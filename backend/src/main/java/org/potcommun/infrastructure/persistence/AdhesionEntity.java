package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "adhesion")
public class AdhesionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "association_id", nullable = false)
    private Integer associationId;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(nullable = false)
    private LocalDate date;

    public Integer getId()            { return id; }
    public Long getUserId()           { return userId; }
    public Integer getAssociationId() { return associationId; }
    public String getRole()           { return role; }
    public LocalDate getDate()        { return date; }
}
