package org.potcommun.api.controller;

import org.potcommun.api.dto.EventSummaryDto;
import org.potcommun.infrastructure.persistence.AssociationEntity;
import org.potcommun.infrastructure.persistence.EvenementEntity;
import org.potcommun.infrastructure.persistence.EvenementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/events")
@CrossOrigin(originPatterns = "*")
public class EventController {

    private final EvenementRepository repo;

    public EventController(EvenementRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public Page<EventSummaryDto> lister(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        if (dateFrom == null) dateFrom = LocalDate.now();

        Pageable pageable = PageRequest.of(page, Math.min(size, 20), Sort.by("releaseDt").ascending());
        String cityParam = (city != null && !city.isBlank()) ? city : null;

        return repo.findAllWithFilters(dateFrom, dateTo, cityParam, pageable)
                   .map(this::toDto);
    }

    @GetMapping("/filter-options")
    public Map<String, List<String>> filterOptions() {
        List<String> cities = repo.findDistinctSiegeSocial()
                .stream()
                .map(this::extractCity)
                .filter(Objects::nonNull)
                .filter(c -> !c.isBlank())
                .distinct()
                .sorted()
                .toList();
        return Map.of("cities", cities);
    }

    private EventSummaryDto toDto(EvenementEntity e) {
        AssociationEntity a = e.getAssociation();
        return new EventSummaryDto(
                e.getId(),
                e.getName(),
                e.getReleaseDt(),
                e.getDuration(),
                e.getSynopsis(),
                e.getAssociationId(),
                a != null ? a.getName()      : null,
                a != null ? a.getCategorie() : null,
                a != null ? a.getSiegeSocial() : null,
                e.getLatitude(),
                e.getLongitude()
        );
    }

    /** Extrait la ville depuis un champ siegeSocial (ex: "12 Rue X, 69001 Lyon" → "Lyon"). */
    private String extractCity(String siegeSocial) {
        if (siegeSocial == null) return null;
        String[] parts = siegeSocial.split(",");
        String last = parts[parts.length - 1].trim();
        return last.replaceAll("^\\d{5}\\s*", "").trim();
    }
}