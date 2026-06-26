package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.CagnotteResponse;
import org.potcommun.api.dto.CreateCagnotteRequest;
import org.potcommun.api.dto.DonStripeRequest;
import org.potcommun.domain.service.AssociationAuthService;
import org.potcommun.domain.service.CagnotteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cagnottes")
public class CagnotteController {

    private final CagnotteService        service;
    private final AssociationAuthService assocService;

    public CagnotteController(CagnotteService service,
                               AssociationAuthService assocService) {
        this.service      = service;
        this.assocService = assocService;
    }

    /**
     * GET /api/cagnottes
     * - Sans paramètre          → toutes les cagnottes actives (page publique)
     * - ?associationId=X        → cagnottes actives d'une association (backoffice)
     */
    @GetMapping
    public List<CagnotteResponse> lister(
            @RequestParam(required = false) Integer associationId,
            @RequestParam(required = false, defaultValue = "false") boolean includeInactif) {
        if (includeInactif && associationId != null) {
            return service.listerParAssociation(associationId);
        }
        return service.lister(associationId);
    }

    /** PATCH /api/cagnottes/{id}/desactiver — clôture une cagnotte (backoffice) */
    @PatchMapping("/{id}/desactiver")
    public CagnotteResponse desactiver(@PathVariable Long id) {
        return service.desactiver(id);
    }

    /** PATCH /api/cagnottes/{id}/activer — réactive une cagnotte (backoffice) */
    @PatchMapping("/{id}/activer")
    public CagnotteResponse activer(@PathVariable Long id) {
        return service.activer(id);
    }

    /** GET /api/cagnottes/{id} */
    @GetMapping("/{id}")
    public CagnotteResponse detail(@PathVariable Long id) {
        return service.trouverParId(id);
    }

    /**
     * POST /api/cagnottes
     * Protégé : l'association doit exister et avoir le statut VALIDATED.
     * L'associationId est envoyé dans le corps (stocké en session côté frontend).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CagnotteResponse creer(@Valid @RequestBody CreateCagnotteRequest request) {
        // Vérifie que l'association est bien validée avant de créer la cagnotte
        assocService.verifierPeutCreerCagnotte(request.associationId());
        return service.creer(request);
    }

    /** POST /api/cagnottes/{id}/don/initier */
    @PostMapping("/{id}/don/initier")
    public Map<String, String> initierDon(
            @PathVariable Long id,
            @Valid @RequestBody DonStripeRequest request) {
        String clientSecret = service.initierDon(id, request.montant());
        return Map.of("clientSecret", clientSecret);
    }

    /** POST /api/cagnottes/{id}/don/confirmer */
    @PostMapping("/{id}/don/confirmer")
    public Map<String, String> confirmerDon(
            @PathVariable Long id,
            @RequestParam BigDecimal montant) {
        service.enregistrerDon(id, montant);
        return Map.of("status", "ok");
    }
}
