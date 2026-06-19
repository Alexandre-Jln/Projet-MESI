package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.*;
import org.potcommun.domain.service.AssociationAuthService;
import org.potcommun.infrastructure.persistence.AssociationEntity;
import org.potcommun.infrastructure.persistence.AssociationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/associations")
public class AssociationController {

    private final AssociationRepository  repo;
    private final AssociationAuthService authService;

    public AssociationController(AssociationRepository repo,
                                 AssociationAuthService authService) {
        this.repo        = repo;
        this.authService = authService;
    }

    // ── Liste publique ─────────────────────────────────────────────────

    @GetMapping
    public List<Map<String, Object>> lister() {
        return repo.findByStatut(AssociationEntity.Statut.VALIDATED)
            .stream()
            .map(a -> Map.<String, Object>of("id", a.getId(), "name", a.getName()))
            .toList();
    }

    // ── Authentification ───────────────────────────────────────────────

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AssociationResponse inscrire(@Valid @RequestBody AssociationRegisterRequest request) {
        return authService.inscrire(request);
    }

    @PostMapping("/auth/login")
    public AssociationResponse connecter(@Valid @RequestBody AssociationLoginRequest request) {
        return authService.connecter(request);
    }

    // ── Coordonnées bancaires ──────────────────────────────────────────

    /**
     * PUT /api/associations/{id}/coordonnees-bancaires
     * Enregistre l'IBAN de l'association.
     * Requis avant de pouvoir créer une cagnotte.
     */
    @PutMapping("/{id}/coordonnees-bancaires")
    public AssociationResponse enregistrerCoordonneesBancaires(
            @PathVariable Integer id,
            @Valid @RequestBody CoordonneesBancairesRequest request) {
        return authService.enregistrerCoordonneesBancaires(id, request);
    }

    // ── Administration ─────────────────────────────────────────────────

    @GetMapping("/admin/en-attente")
    public List<AssociationResponse> enAttente() {
        return authService.listerEnAttente();
    }

    @GetMapping("/admin/toutes")
    public List<AssociationResponse> toutes() {
        return authService.listerToutes();
    }

    @PutMapping("/{id}/valider")
    public AssociationResponse valider(@PathVariable Integer id) {
        return authService.valider(id);
    }

    @PutMapping("/{id}/rejeter")
    public AssociationResponse rejeter(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String motif = body != null ? body.getOrDefault("motif", "") : "";
        return authService.rejeter(id, motif);
    }
}
