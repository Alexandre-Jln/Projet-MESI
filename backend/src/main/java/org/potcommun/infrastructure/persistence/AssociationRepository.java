package org.potcommun.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssociationRepository extends JpaRepository<AssociationEntity, Integer> {

    /** Recherche par hash d'email pour l'authentification. */
    Optional<AssociationEntity> findByEmailHash(String emailHash);

    /** Recherche par SIRET pour éviter les doublons à l'inscription. */
    Optional<AssociationEntity> findBySiret(String siret);

    /** Liste toutes les associations en attente de validation (page admin). */
    List<AssociationEntity> findByStatutOrderByDateInscriptionAsc(AssociationEntity.Statut statut);

    /** Liste les associations validées (pour le select de création de cagnotte). */
    List<AssociationEntity> findByStatut(AssociationEntity.Statut statut);
}
