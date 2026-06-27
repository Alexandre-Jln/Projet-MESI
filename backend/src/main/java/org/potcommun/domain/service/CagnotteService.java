package org.potcommun.domain.service;

import org.potcommun.api.dto.CagnotteResponse;
import org.potcommun.api.dto.CreateCagnotteRequest;
import org.potcommun.infrastructure.persistence.CagnotteEntity;
import org.potcommun.infrastructure.persistence.CagnotteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CagnotteService {

    private final CagnotteRepository repo;
    private final StripeService stripeService;

    public CagnotteService(CagnotteRepository repo, StripeService stripeService) {
        this.repo = repo;
        this.stripeService = stripeService;
    }

    /** Retourne toutes les cagnottes actives, les plus récentes en premier. */
    public List<CagnotteResponse> listerActives() {
        return repo.findByActifTrueOrderByDateCreationDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /** Retourne une cagnotte par son ID. */
    public CagnotteResponse trouverParId(Long id) {
        return repo.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new NoSuchElementException("Cagnotte introuvable : " + id));
    }

    /** Crée une nouvelle cagnotte et la persiste. */
    @Transactional
    public CagnotteResponse creer(CreateCagnotteRequest request) {
        CagnotteEntity entity = new CagnotteEntity();
        entity.setTitre(request.titre());
        entity.setDescription(request.description());
        entity.setObjectif(request.objectif());
        entity.setAssociationId(request.associationId());
        entity.setDateFin(request.dateFin());
        return toResponse(repo.save(entity));
    }

    /**
     * Initie un don Stripe :
     * 1. Vérifie que la cagnotte existe et est active
     * 2. Crée un PaymentIntent via Stripe
     * 3. Retourne le client_secret pour que le frontend finalise le paiement
     */
    public String initierDon(Long cagnotteId, BigDecimal montant) {
        CagnotteEntity cagnotte = repo.findById(cagnotteId)
                .orElseThrow(() -> new NoSuchElementException("Cagnotte introuvable : " + cagnotteId));

        if (!cagnotte.isActif()) {
            throw new IllegalStateException("Cette cagnotte n'est plus active.");
        }

        return stripeService.creerPaymentIntent(montant, cagnotteId);
    }

    /**
     * Appelé après confirmation du paiement par le frontend.
     * Met à jour le montant collecté en BDD.
     * (En production, préférer un webhook Stripe pour garantir la fiabilité.)
     */
    @Transactional
    public void enregistrerDon(Long cagnotteId, BigDecimal montant) {
        CagnotteEntity cagnotte = repo.findById(cagnotteId)
                .orElseThrow(() -> new NoSuchElementException("Cagnotte introuvable : " + cagnotteId));

        cagnotte.setMontantCollecte(cagnotte.getMontantCollecte().add(montant));
        repo.save(cagnotte);
    }

    private CagnotteResponse toResponse(CagnotteEntity e) {
        return new CagnotteResponse(
                e.getId(), e.getTitre(), e.getDescription(),
                e.getObjectif(), e.getMontantCollecte(),
                e.getAssociationId(), e.getDateCreation(),
                e.getDateFin(), e.isActif()
        );
    }
}
