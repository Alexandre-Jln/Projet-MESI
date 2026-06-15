package org.potcommun.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvenementRepository extends JpaRepository<EvenementEntity, Integer> {

    List<EvenementEntity> findByLatitudeIsNotNullAndLongitudeIsNotNull(Pageable pageable);
}
