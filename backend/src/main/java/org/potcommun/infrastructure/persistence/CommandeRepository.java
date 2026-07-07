package org.potcommun.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommandeRepository extends JpaRepository<CommandeEntity, Integer> {}
