package org.potcommun.api.controller;

import org.potcommun.infrastructure.persistence.EvenementPhotoEntity;
import org.potcommun.infrastructure.persistence.EvenementPhotoRepository;
import org.potcommun.infrastructure.persistence.EvenementRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
public class EvenementPhotoController {

    private final EvenementPhotoRepository photoRepo;
    private final EvenementRepository      evenementRepo;

    public EvenementPhotoController(EvenementPhotoRepository photoRepo,
                                    EvenementRepository evenementRepo) {
        this.photoRepo     = photoRepo;
        this.evenementRepo = evenementRepo;
    }

    /** POST /evenements/{id}/photos/upload — ajoute une photo (max 5) */
    @PostMapping("/evenements/{id}/photos/upload")
    @ResponseStatus(HttpStatus.CREATED)
    public Integer upload(@PathVariable Integer id,
                          @RequestParam("file") MultipartFile file,
                          @RequestParam(required = false, defaultValue = "0") Integer ordre) {
        evenementRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable."));

        if (photoRepo.countByEvenementId(id) >= 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 5 photos par événement.");
        }

        try {
            EvenementPhotoEntity photo = new EvenementPhotoEntity();
            photo.setEvenementId(id);
            photo.setData(file.getBytes());
            photo.setMimeType(file.getContentType());
            photo.setOrdre(ordre);
            return photoRepo.save(photo).getId();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lecture fichier.");
        }
    }

    /** GET /evenements/photos/{photoId} — sert l'image binaire */
    @GetMapping("/evenements/photos/{photoId}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Integer photoId) {
        EvenementPhotoEntity photo = photoRepo.findById(photoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo introuvable."));

        String mime = photo.getMimeType() != null ? photo.getMimeType() : "image/jpeg";
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(mime))
            .body(photo.getData());
    }

    /** DELETE /evenements/photos/{photoId} — supprime une photo */
    @DeleteMapping("/evenements/photos/{photoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhoto(@PathVariable Integer photoId) {
        EvenementPhotoEntity photo = photoRepo.findById(photoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo introuvable."));
        photoRepo.delete(photo);
    }
}
