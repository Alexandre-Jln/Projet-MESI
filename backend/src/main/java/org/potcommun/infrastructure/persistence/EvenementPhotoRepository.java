package org.potcommun.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EvenementPhotoRepository extends JpaRepository<EvenementPhotoEntity, Integer> {
    List<EvenementPhotoEntity> findByEvenementIdOrderByOrdre(Integer evenementId);
    void deleteByEvenementId(Integer evenementId);
    long countByEvenementId(Integer evenementId);
}
