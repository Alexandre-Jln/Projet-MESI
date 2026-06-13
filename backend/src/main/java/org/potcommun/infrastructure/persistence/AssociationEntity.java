package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;

@Entity
@Table(name = "association")
public class AssociationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    public Integer getId() { return id; }
    public String getName() { return name; }
}
