package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "association")
public class AssociationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 250)
    private String categorie;

    @Column(nullable = false, unique = true, length = 250)
    private String email;

    @Column(unique = true, length = 250)
    private String siret;

    @Column(name = "siege_social", length = 250)
    private String siegeSocial;

    @Column(length = 20)
    private String telephone;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    public Integer getId()            { return id; }
    public String getName()           { return name; }
    public String getCategorie()      { return categorie; }
    public String getEmail()          { return email; }
    public String getSiret()          { return siret; }
    public String getSiegeSocial()    { return siegeSocial; }
    public String getTelephone()      { return telephone; }
    public BigDecimal getLatitude()   { return latitude; }
    public BigDecimal getLongitude()  { return longitude; }
}