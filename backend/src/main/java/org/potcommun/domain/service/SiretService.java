package org.potcommun.domain.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Vérifie qu'un SIRET correspond à une association française active
 * via l'API publique data.gouv.fr (Annuaire des Entreprises).
 *
 * Les associations ont un code nature_juridique commençant par "92"
 * (ex : 9220 = association déclarée, 9221, 9222…).
 */
@Service
public class SiretService {

    private static final String API_URL =
        "https://recherche-entreprises.api.gouv.fr/search?q=";

    private final HttpClient  http   = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private final ObjectMapper mapper = new ObjectMapper();

    public record ResultatSiret(
        boolean valide,
        boolean estAssociation,
        boolean estActive,
        String  nomOfficiel,
        String  adresse,
        String  messageErreur
    ) {}

    public ResultatSiret verifier(String siret) {
        String siretNettoye = siret.replaceAll("\\s", "");

        if (siretNettoye.length() != 14) {
            return invalide("Le SIRET doit contenir exactement 14 chiffres.");
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL + siretNettoye))
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = http.send(request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return serviceIndisponible("HTTP " + response.statusCode());
            }

            JsonNode root    = mapper.readTree(response.body());
            JsonNode results = root.path("results");

            if (!results.isArray() || results.isEmpty()) {
                return invalide("Aucune organisation trouvée pour ce SIRET.");
            }

            JsonNode org = results.get(0);

            // ── Détection association ─────────────────────────────────────
            // L'API data.gouv.fr expose le code sous "nature_juridique" (ex: "9220")
            // Les associations ont des codes commençant par "92"
            String natureJuridique = org.path("nature_juridique").asText("");

            // Fallback : certaines versions de l'API utilisent "categorie_juridique"
            if (natureJuridique.isEmpty()) {
                natureJuridique = org.path("categorie_juridique").asText("");
            }

            boolean estAssociation = natureJuridique.startsWith("92");

            // Dernier recours : si le nom contient "ASSOCIATION"
            String nomBrut = org.path("nom_complet").asText("");
            if (!estAssociation && nomBrut.toUpperCase().contains("ASSOCIATION")) {
                estAssociation = true;
            }

            // ── État administratif ────────────────────────────────────────
            // "A" = actif, "F" = fermé/radié
            String etat      = org.path("etat_administratif").asText("");
            boolean estActive = "A".equalsIgnoreCase(etat);

            // ── Adresse ───────────────────────────────────────────────────
            String adresse = org.path("siege").path("adresse").asText("");
            if (adresse.isEmpty()) {
                adresse = org.path("siege").path("libelle_commune").asText("");
            }

            // ── Résultat ──────────────────────────────────────────────────
            if (!estAssociation) {
                return new ResultatSiret(false, false, estActive,
                    nomBrut.isEmpty() ? null : nomBrut, adresse,
                    "Ce SIRET ne correspond pas à une association "
                    + "(code nature juridique : " + natureJuridique + "). "
                    + "Seules les associations déclarées (9220, 9221…) sont acceptées.");
            }

            if (!estActive) {
                return new ResultatSiret(false, true, false,
                    nomBrut.isEmpty() ? null : nomBrut, adresse,
                    "Cette association n'est plus active (radiée ou dissoute).");
            }

            return new ResultatSiret(true, true, true,
                nomBrut.isEmpty() ? null : nomBrut, adresse, null);

        } catch (Exception e) {
            // Erreur réseau → service indisponible, on laisse passer avec vérif manuelle
            return serviceIndisponible(e.getMessage());
        }
    }

    private ResultatSiret invalide(String msg) {
        return new ResultatSiret(false, false, false, null, null, msg);
    }

    private ResultatSiret serviceIndisponible(String detail) {
        return new ResultatSiret(false, false, false, null, null,
            "Impossible de vérifier le SIRET pour l'instant ("
            + detail + "). Votre demande sera vérifiée manuellement.");
    }
}
