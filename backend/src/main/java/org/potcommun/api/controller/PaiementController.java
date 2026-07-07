package org.potcommun.api.controller;

import org.potcommun.api.dto.PaiementResponse;
import org.potcommun.infrastructure.persistence.CommandeRepository;
import org.potcommun.infrastructure.persistence.EvenementRepository;
import org.potcommun.infrastructure.persistence.PaiementRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PaiementController {

    private final PaiementRepository  paiementRepo;
    private final CommandeRepository  commandeRepo;
    private final EvenementRepository evenementRepo;

    public PaiementController(PaiementRepository paiementRepo,
                               CommandeRepository commandeRepo,
                               EvenementRepository evenementRepo) {
        this.paiementRepo  = paiementRepo;
        this.commandeRepo  = commandeRepo;
        this.evenementRepo = evenementRepo;
    }

    /**
     * GET /paiements/read?associationId=X
     * Retourne l'historique des paiements (billets) liés aux événements de l'association.
     * Jointure : paiement → commande → evenement → association_id = X
     * Lecture seule — les actions Stripe restent dans Epic 5.
     */
    @GetMapping("/paiements/read")
    public List<PaiementResponse> read(@RequestParam Integer associationId) {
        return paiementRepo.findByAssociationId(associationId)
            .stream()
            .map(p -> {
                String nomEvenement = null;
                if (p.getCommandeId() != null) {
                    nomEvenement = commandeRepo.findById(p.getCommandeId())
                        .flatMap(c -> evenementRepo.findById(c.getEvenementId()))
                        .map(e -> e.getName())
                        .orElse(null);
                }
                return new PaiementResponse(
                    p.getId(),
                    p.getModePaiement(),
                    p.getDate(),
                    p.getMontant(),
                    p.getStatus(),
                    nomEvenement
                );
            })
            .toList();
    }
}
