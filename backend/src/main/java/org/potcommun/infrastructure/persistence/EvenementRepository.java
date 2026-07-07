package org.potcommun.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EvenementRepository extends JpaRepository<EvenementEntity, Integer> {

    List<EvenementEntity> findByLatitudeIsNotNullAndLongitudeIsNotNull(Pageable pageable);

    List<EvenementEntity> findByAssociationIdOrderByReleaseDtDesc(Integer associationId);

    @Query("""
        SELECT e FROM EvenementEntity e
        WHERE (:dateFrom IS NULL OR e.releaseDt >= :dateFrom)
          AND (:dateTo   IS NULL OR e.releaseDt <= :dateTo)
          AND e.brouillon = false
        ORDER BY e.releaseDt ASC
        """)
    List<EvenementEntity> findFiltered(
        @Param("dateFrom") LocalDate dateFrom,
        @Param("dateTo")   LocalDate dateTo
    );

    @Query("SELECT COUNT(c) FROM CommandeEntity c WHERE c.evenementId = :evenementId")
    Long countBilletsByEvenementId(@Param("evenementId") Integer evenementId);
}
