package org.potcommun.api.controller;

import org.potcommun.api.dto.AdhesionResponse;
import org.potcommun.infrastructure.persistence.AdhesionRepository;
import org.potcommun.infrastructure.persistence.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AdhesionController {

    private final AdhesionRepository adhesionRepo;
    private final UserRepository     userRepo;

    public AdhesionController(AdhesionRepository adhesionRepo, UserRepository userRepo) {
        this.adhesionRepo = adhesionRepo;
        this.userRepo     = userRepo;
    }

    /** GET /adhesions/read?associationId=X — adhérents d'une association */
    @GetMapping("/adhesions/read")
    public List<AdhesionResponse> read(@RequestParam Integer associationId) {
        return adhesionRepo.findByAssociationIdOrderByDateDesc(associationId)
            .stream()
            .map(a -> {
                var user = userRepo.findById(a.getUserId()).orElse(null);
                return new AdhesionResponse(
                    a.getId(),
                    a.getUserId(),
                    a.getRole(),
                    a.getDate(),
                    user != null ? user.getEmail() : null,
                    null,
                    null
                );
            })
            .toList();
    }
}
