package org.potcommun.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssociationRepository extends JpaRepository<AssociationEntity, Integer> {

    List<AssociationEntity> findByLatitudeIsNotNullAndLongitudeIsNotNull(Pageable pageable);
}