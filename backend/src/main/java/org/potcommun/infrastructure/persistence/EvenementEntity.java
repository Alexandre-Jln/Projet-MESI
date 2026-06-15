package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "evenement")
public class EvenementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 250)
    private String name;

    @Column(name = "length")
    private Integer duration;

    @Column(name = "release_dt")
    private LocalDate releaseDt;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    @Column(name = "association_id", nullable = false)
    private Integer associationId;

    @Column(precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    public Integer getId()            { return id; }
    public String getName()           { return name; }
    public Integer getDuration()      { return duration; }
    public LocalDate getReleaseDt()   { return releaseDt; }
    public String getSynopsis()       { return synopsis; }
    public Integer getAssociationId() { return associationId; }
    public BigDecimal getLatitude()   { return latitude; }
    public BigDecimal getLongitude()  { return longitude; }
}