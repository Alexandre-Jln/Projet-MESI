package org.potcommun.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaiementRepository extends JpaRepository<PaiementEntity, Integer> {

    /**
     * Récupère les paiements liés aux événements d'une association.
     * Jointure : paiement → commande → evenement → association_id = :associationId
     */
    @Query("""
        SELECT p FROM PaiementEntity p
        JOIN CommandeEntity c ON c.id = p.commandeId
        JOIN EvenementEntity e ON e.id = c.evenementId
        WHERE e.associationId = :associationId
        ORDER BY p.date DESC
        """)
    List<PaiementEntity> findByAssociationId(@Param("associationId") Integer associationId);
}
