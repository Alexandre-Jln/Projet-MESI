package org.potcommun.api.controller;

import org.potcommun.infrastructure.persistence.AssociationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/associations")
public class AssociationController {

    private final AssociationRepository repo;

    public AssociationController(AssociationRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> lister() {
        return repo.findAll().stream()
                .map(a -> Map.<String, Object>of("id", a.getId(), "name", a.getName()))
                .toList();
    }
}
