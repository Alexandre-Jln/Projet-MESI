package org.potcommun.domain.dto.response;

import java.time.LocalDate;

public record MapMarkerDto(
        Long id,
        String name,
        Double lat,
        Double lng,
        LocalDate startDate
) {}