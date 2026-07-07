package org.potcommun.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdhesionRepository extends JpaRepository<AdhesionEntity, Integer> {
    List<AdhesionEntity> findByAssociationIdOrderByDateDesc(Integer associationId);
}