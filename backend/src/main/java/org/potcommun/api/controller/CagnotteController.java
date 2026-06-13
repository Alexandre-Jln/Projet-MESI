package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.CagnotteResponse;
import org.potcommun.api.dto.CreateCagnotteRequest;
import org.potcommun.api.dto.DonStripeRequest;
import org.potcommun.domain.service.CagnotteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cagnottes")
public class CagnotteController {

    private final CagnotteService service;

    public CagnotteController(CagnotteService service) {
        this.service = service;
    }

    /** GET /api/cagnottes — liste toutes les cagnottes actives */
    @GetMapping
    public List<CagnotteResponse> lister() {
        return service.listerActives();
    }

    /** GET /api/cagnottes/{id} — détail d'une cagnotte */
    @GetMapping("/{id}")
    public CagnotteResponse detail(@PathVariable Long id) {
        return service.trouverParId(id);
    }

    /** POST /api/cagnottes — créer une nouvelle cagnotte */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CagnotteResponse creer(@Valid @RequestBody CreateCagnotteRequest request) {
        return service.creer(request);
    }

    /**
     * POST /api/cagnottes/{id}/don/initier
     * Crée un PaymentIntent Stripe et retourne le client_secret au frontend.
     */
    @PostMapping("/{id}/don/initier")
    public Map<String, String> initierDon(
            @PathVariable Long id,
            @Valid @RequestBody DonStripeRequest request) {

        String clientSecret = service.initierDon(id, request.montant());
        return Map.of("clientSecret", clientSecret);
    }

    /**
     * POST /api/cagnottes/{id}/don/confirmer?montant=15.00
     * Appelé par le frontend après confirmation Stripe réussie.
     * Met à jour le montant collecté en BDD.
     */
    @PostMapping("/{id}/don/confirmer")
    public Map<String, String> confirmerDon(
            @PathVariable Long id,
            @RequestParam BigDecimal montant) {

        service.enregistrerDon(id, montant);
        return Map.of("status", "ok");
    }
}
