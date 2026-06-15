package org.potcommun.domain.service;

import org.potcommun.api.dto.AssociationLoginRequest;
import org.potcommun.api.dto.AssociationRegisterRequest;
import org.potcommun.api.dto.AssociationResponse;
import org.potcommun.api.dto.CoordonneesBancairesRequest;
import org.potcommun.domain.exception.AssociationAlreadyExistsException;
import org.potcommun.domain.exception.AssociationNotValidatedException;
import org.potcommun.domain.exception.InvalidCredentialsException;
import org.potcommun.infrastructure.persistence.AssociationEntity;
import org.potcommun.infrastructure.persistence.AssociationRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AssociationAuthService {

    private final AssociationRepository repo;
    private final PasswordEncoder        encoder;
    private final SiretService           siretService;

    public AssociationAuthService(AssociationRepository repo,
                                  PasswordEncoder encoder,
                                  SiretService siretService) {
        this.repo         = repo;
        this.encoder      = encoder;
        this.siretService = siretService;
    }

    // ── Inscription ────────────────────────────────────────────────────

    @Transactional
    public AssociationResponse inscrire(AssociationRegisterRequest request) {

        String siretNettoye = request.siret().replaceAll("\\s", "");
        SiretService.ResultatSiret siretResult = siretService.verifier(siretNettoye);

        if (!siretResult.valide()) {
            boolean serviceIndisponible = siretResult.messageErreur() != null
                    && siretResult.messageErreur().startsWith("Impossible de vérifier");
            if (!serviceIndisponible) {
                throw new org.potcommun.domain.exception.SiretInvalidException(
                    siretResult.messageErreur() != null
                        ? siretResult.messageErreur()
                        : "SIRET invalide ou ne correspondant pas à une association active.");
            }
        }

        String emailHash = hashEmail(request.email());
        if (repo.findByEmailHash(emailHash).isPresent()) {
            throw new AssociationAlreadyExistsException(
                "Un compte association existe déjà avec cet email.");
        }
        if (repo.findBySiret(siretNettoye).isPresent()) {
            throw new AssociationAlreadyExistsException(
                "Un compte association existe déjà avec ce SIRET.");
        }

        AssociationEntity asso = new AssociationEntity();
        asso.setName(siretResult.nomOfficiel() != null
                ? siretResult.nomOfficiel()
                : (request.nom() != null && !request.nom().isBlank() ? request.nom() : "Association"));
        asso.setSiret(siretNettoye);
        asso.setEmail(request.email());
        asso.setEmailHash(emailHash);
        asso.setPasswordHash(encoder.encode(request.password()));
        asso.setDescription(request.description());
        asso.setTelephone(request.telephone());
        asso.setSiegeSocial(siretResult.adresse());
        asso.setStatut(AssociationEntity.Statut.PENDING);
        asso.setDateInscription(LocalDateTime.now());

        return AssociationResponse.from(repo.save(asso));
    }

    // ── Connexion ──────────────────────────────────────────────────────

    public AssociationResponse connecter(AssociationLoginRequest request) {
        String emailHash = hashEmail(request.email());

        AssociationEntity asso = repo.findByEmailHash(emailHash)
                .orElseThrow(InvalidCredentialsException::new);

        if (asso.getPasswordHash() == null
                || !encoder.matches(request.password(), asso.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return AssociationResponse.from(asso);
    }

    // ── Coordonnées bancaires ──────────────────────────────────────────

    /**
     * Enregistre l'IBAN de l'association.
     * Placeholder pour l'intégration Stripe Connect future :
     * ces données seront utilisées pour configurer les virements automatiques.
     */
    @Transactional
    public AssociationResponse enregistrerCoordonneesBancaires(
            Integer id, CoordonneesBancairesRequest request) {

        AssociationEntity asso = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Association introuvable : " + id));

        // Nettoyage IBAN : on retire les espaces
        String ibanNettoye = request.iban().replaceAll("\\s", "").toUpperCase();
        asso.setIban(ibanNettoye);

        return AssociationResponse.from(repo.save(asso));
    }

    // ── Administration ─────────────────────────────────────────────────

    public List<AssociationResponse> listerEnAttente() {
        return repo.findByStatutOrderByDateInscriptionAsc(AssociationEntity.Statut.PENDING)
                .stream().map(AssociationResponse::from).toList();
    }

    public List<AssociationResponse> listerToutes() {
        return repo.findAll().stream().map(AssociationResponse::from).toList();
    }

    @Transactional
    public AssociationResponse valider(Integer id) {
        AssociationEntity asso = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Association introuvable : " + id));
        asso.setStatut(AssociationEntity.Statut.VALIDATED);
        asso.setDateValidation(LocalDateTime.now());
        asso.setMotifRejet(null);
        return AssociationResponse.from(repo.save(asso));
    }

    @Transactional
    public AssociationResponse rejeter(Integer id, String motif) {
        AssociationEntity asso = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Association introuvable : " + id));
        asso.setStatut(AssociationEntity.Statut.REJECTED);
        asso.setMotifRejet(motif);
        return AssociationResponse.from(repo.save(asso));
    }

    // ── Vérification pour la création de cagnotte ──────────────────────

    /**
     * Vérifie que l'association peut créer une cagnotte.
     * Conditions :
     *  1. Statut VALIDATED (compte approuvé par un admin)
     *  2. IBAN enregistré (coordonnées bancaires complétées)
     */
    public void verifierPeutCreerCagnotte(Integer associationId) {
        AssociationEntity asso = repo.findById(associationId)
                .orElseThrow(() -> new NoSuchElementException(
                    "Association introuvable : " + associationId));

        if (asso.getStatut() == AssociationEntity.Statut.PENDING) {
            throw new AssociationNotValidatedException(
                "Votre compte est en attente de validation. "
                + "Vous pourrez créer des cagnottes une fois votre compte approuvé.");
        }
        if (asso.getStatut() == AssociationEntity.Statut.REJECTED) {
            throw new AssociationNotValidatedException(
                "Votre compte a été rejeté. Contactez l'équipe PotCommun.");
        }
        if (asso.getIban() == null || asso.getIban().isBlank()) {
            throw new AssociationNotValidatedException(
                "Vous devez enregistrer vos coordonnées bancaires avant de créer une cagnotte.");
        }
    }

    // ── Utilitaire ─────────────────────────────────────────────────────

    private String hashEmail(String email) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(
                email.toLowerCase().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 indisponible", e);
        }
    }
}
