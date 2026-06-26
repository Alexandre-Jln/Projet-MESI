import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/**
 * @typedef {Object} EventSummary
 * @property {number}  id
 * @property {string}  name
 * @property {string}  releaseDt           - "YYYY-MM-DD"
 * @property {number}  duration            - durée en jours
 * @property {string}  synopsis
 * @property {number}  associationId
 * @property {string}  associationName
 * @property {number}  nombreBillets
 */

export function useEvents({ page = 0, size = 20, city = "", dateFrom = "", dateTo = "" } = {}) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo)   params.set("dateTo",   dateTo);

        fetch(`${API_URL}/evenements/read?${params.toString()}`)
            .then(r => {
                if (!r.ok) throw new Error("Erreur serveur");
                return r.json();
            })
            .then(events => {
                // Filtre ville côté client (le champ lieu n'est pas en DB —
                // la localisation est lat/lng, on filtre sur associationName comme fallback)
                let filtered = events;
                if (city) {
                    filtered = filtered.filter(e =>
                        (e.associationName ?? "").toLowerCase().includes(city.toLowerCase())
                    );
                }

                const totalElements = filtered.length;
                const totalPages    = Math.max(1, Math.ceil(totalElements / size));
                const safePage      = Math.min(page, totalPages - 1);
                const content       = filtered.slice(safePage * size, safePage * size + size);

                setData({ content, totalPages, totalElements, number: safePage, size });
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [page, size, city, dateFrom, dateTo]);

    return { data, loading, error };
}

export function fetchEventFilterOptions() {
    // Les villes ne sont plus dans les données (lieu = lat/lng en DB).
    // On retourne une liste vide — le filtre ville sera alimenté
    // quand le champ lieu textuel sera ajouté à la table evenement.
    return Promise.resolve({ cities: [] });
}
