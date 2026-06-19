package org.potcommun.api.controller;

import org.potcommun.domain.dto.response.MapMarkerDto;
import org.potcommun.infrastructure.persistence.AssociationRepository;
import org.potcommun.infrastructure.persistence.EvenementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class MapController {

    private static final int MAX_MARKERS = 200;

    private final AssociationRepository associationRepository;
    private final EvenementRepository evenementRepository;

    public MapController(AssociationRepository associationRepository,
                         EvenementRepository evenementRepository) {
        this.associationRepository = associationRepository;
        this.evenementRepository   = evenementRepository;
    }

    @GetMapping("/associations/map")
    public List<MapMarkerDto> associationsMap() {
        return associationRepository
                .findByLatitudeIsNotNullAndLongitudeIsNotNull(PageRequest.of(0, MAX_MARKERS))
                .stream()
                .map(a -> new MapMarkerDto(
                        a.getId().longValue(),
                        a.getName(),
                        a.getLatitude().doubleValue(),
                        a.getLongitude().doubleValue(),
                        null
                ))
                .toList();
    }

    @GetMapping("/events/map")
    public List<MapMarkerDto> eventsMap() {
        return evenementRepository
                .findByLatitudeIsNotNullAndLongitudeIsNotNull(PageRequest.of(0, MAX_MARKERS))
                .stream()
                .map(e -> new MapMarkerDto(
                        e.getId().longValue(),
                        e.getName(),
                        e.getLatitude().doubleValue(),
                        e.getLongitude().doubleValue(),
                        e.getReleaseDt()
                ))
                .toList();
    }
}
