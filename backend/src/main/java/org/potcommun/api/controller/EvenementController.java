package org.potcommun.api.controller;

import jakarta.validation.Valid;
import org.potcommun.api.dto.CreateEvenementRequest;
import org.potcommun.api.dto.UpdateEvenementRequest;
import org.potcommun.api.dto.EvenementResponse;
import org.potcommun.infrastructure.persistence.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
public class EvenementController {

    private final EvenementRepository      evenementRepo;
    private final AssociationRepository    associationRepo;
    private final EvenementPhotoRepository photoRepo;

    public EvenementController(EvenementRepository evenementRepo,
                                AssociationRepository associationRepo,
                                EvenementPhotoRepository photoRepo) {
        this.evenementRepo  = evenementRepo;
        this.associationRepo = associationRepo;
        this.photoRepo       = photoRepo;
    }

    /**
     * GET /evenements/read
     * - ?associationId=X  → événements d'une association (backoffice)
     * - ?dateFrom / ?dateTo → filtres pour la page publique (2.4)
     */
    @GetMapping("/evenements/read")
    public List<EvenementResponse> read(
            @RequestParam(required = false) Integer   associationId,
            @RequestParam(required = false) LocalDate dateFrom,
            @RequestParam(required = false) LocalDate dateTo) {

        List<EvenementEntity> evenements = associationId != null
            ? evenementRepo.findByAssociationIdOrderByReleaseDtDesc(associationId)
            : evenementRepo.findFiltered(dateFrom, dateTo);

        return evenements.stream()
            .map(e -> {
                Optional<AssociationEntity> assoc = associationRepo.findById(e.getAssociationId());
                String name      = assoc.map(AssociationEntity::getName).orElse("—");
                String categorie = assoc.map(AssociationEntity::getCategorie).orElse(null);
                Long   billets   = evenementRepo.countBilletsByEvenementId(e.getId());
                List<Integer> photoIds = photoRepo.findByEvenementIdOrderByOrdre(e.getId())
                    .stream().map(EvenementPhotoEntity::getId).toList();
                return EvenementResponse.from(e, name, categorie, billets, photoIds);
            })
            .toList();
    }

    /** POST /evenements/create — crée un événement (backoffice association) */
    @PostMapping("/evenements/create")
    @ResponseStatus(HttpStatus.CREATED)
    public EvenementResponse create(@Valid @RequestBody CreateEvenementRequest req) {
        AssociationEntity assoc = associationRepo.findById(req.associationId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Association introuvable."));

        EvenementEntity e = new EvenementEntity();
        e.setName(req.name());
        e.setSynopsis(req.synopsis());
        e.setReleaseDt(req.releaseDt());
        e.setDuration(req.duration());
        e.setAssociationId(req.associationId());
        e.setBrouillon(Boolean.TRUE.equals(req.brouillon()));

        EvenementEntity saved = evenementRepo.save(e);
        return EvenementResponse.from(saved, assoc.getName(), assoc.getCategorie(), 0L, List.of());
    }

    /** PUT /evenements/update/{id} — modifie un événement (backoffice association) */
    @PutMapping("/evenements/update/{id}")
    public EvenementResponse update(@PathVariable Integer id,
                                     @Valid @RequestBody UpdateEvenementRequest req) {
        EvenementEntity e = evenementRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable."));

        e.setName(req.name());
        e.setSynopsis(req.synopsis());
        e.setReleaseDt(req.releaseDt());
        e.setDuration(req.duration());
        e.setBrouillon(Boolean.TRUE.equals(req.brouillon()));

        EvenementEntity saved = evenementRepo.save(e);

        Optional<AssociationEntity> assoc = associationRepo.findById(saved.getAssociationId());
        String assocName     = assoc.map(AssociationEntity::getName).orElse("—");
        String assocCategorie = assoc.map(AssociationEntity::getCategorie).orElse(null);
        Long   billets       = evenementRepo.countBilletsByEvenementId(saved.getId());
        List<Integer> photoIds = photoRepo.findByEvenementIdOrderByOrdre(saved.getId())
            .stream().map(EvenementPhotoEntity::getId).toList();

        return EvenementResponse.from(saved, assocName, assocCategorie, billets, photoIds);
    }

    /** DELETE /evenements/delete/{id} — supprime un événement et ses photos */
    @DeleteMapping("/evenements/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        EvenementEntity e = evenementRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable."));
        photoRepo.deleteByEvenementId(id);
        evenementRepo.delete(e);
    }
}
