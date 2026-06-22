package org.potcommun.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EvenementRepository extends JpaRepository<EvenementEntity, Integer> {

    List<EvenementEntity> findByLatitudeIsNotNullAndLongitudeIsNotNull(Pageable pageable);

    @Query(
        value = "SELECT e FROM EvenementEntity e JOIN FETCH e.association a " +
                "WHERE (:dateFrom IS NULL OR e.releaseDt >= :dateFrom) " +
                "AND (:dateTo IS NULL OR e.releaseDt <= :dateTo) " +
                "AND (:city IS NULL OR LOWER(a.siegeSocial) LIKE LOWER(CONCAT('%', :city, '%')))",
        countQuery = "SELECT COUNT(e) FROM EvenementEntity e JOIN e.association a " +
                     "WHERE (:dateFrom IS NULL OR e.releaseDt >= :dateFrom) " +
                     "AND (:dateTo IS NULL OR e.releaseDt <= :dateTo) " +
                     "AND (:city IS NULL OR LOWER(a.siegeSocial) LIKE LOWER(CONCAT('%', :city, '%')))"
    )
    Page<EvenementEntity> findAllWithFilters(
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo")   LocalDate dateTo,
            @Param("city")     String city,
            Pageable pageable
    );

    @Query("SELECT DISTINCT a.siegeSocial FROM EvenementEntity e JOIN e.association a WHERE a.siegeSocial IS NOT NULL")
    List<String> findDistinctSiegeSocial();
}