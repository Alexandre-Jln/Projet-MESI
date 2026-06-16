package org.potcommun.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CagnotteRepository extends JpaRepository<CagnotteEntity, Long> {
    List<CagnotteEntity> findByActifTrueOrderByDateCreationDesc();
    List<CagnotteEntity> findByAssociationIdAndActifTrue(Integer associationId);
}
