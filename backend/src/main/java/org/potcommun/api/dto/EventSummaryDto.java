package org.potcommun.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EventSummaryDto(
        Integer   id,
        String    name,
        LocalDate releaseDt,
        Integer   duration,
        String    synopsis,
        Integer   associationId,
        String    associationName,
        String    associationCategorie,
        String    lieu,
        BigDecimal latitude,
        BigDecimal longitude
) {}
