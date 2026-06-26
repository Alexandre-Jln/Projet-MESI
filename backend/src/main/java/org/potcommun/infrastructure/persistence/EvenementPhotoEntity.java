package org.potcommun.infrastructure.persistence;

import jakarta.persistence.*;

@Entity
@Table(name = "evenement_photo")
public class EvenementPhotoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "evenement_id", nullable = false)
    private Integer evenementId;

    @Lob
    @Column(name = "data", nullable = false, columnDefinition = "MEDIUMBLOB")
    private byte[] data;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "ordre")
    private Integer ordre;

    public Integer getId()          { return id; }
    public Integer getEvenementId() { return evenementId; }
    public byte[]  getData()        { return data; }
    public String  getMimeType()    { return mimeType; }
    public Integer getOrdre()       { return ordre; }

    public void setEvenementId(Integer v) { this.evenementId = v; }
    public void setData(byte[] v)         { this.data = v; }
    public void setMimeType(String v)     { this.mimeType = v; }
    public void setOrdre(Integer v)       { this.ordre = v; }
}
