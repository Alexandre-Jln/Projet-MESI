import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8082";

/**
 * @typedef {Object} EventSummary
 * @property {number}  id
 * @property {string}  name
 * @property {string}  releaseDt       - ISO date "YYYY-MM-DD"
 * @property {number}  duration        - durée en jours
 * @property {string}  synopsis
 * @property {number}  associationId
 * @property {string}  associationName
 * @property {string}  associationCategorie
 * @property {string}  lieu            - siegeSocial de l'association
 * @property {number}  latitude
 * @property {number}  longitude
 */

export function useEvents({ page = 0, size = 20, city = "", dateFrom = "", dateTo = "" } = {}) {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ page: String(page), size: String(size) });
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo)   params.set("dateTo", dateTo);
        if (city)     params.set("city", city);

        fetch(`${API_BASE}/api/v1/events?${params}`, { signal: controller.signal })
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(d => { setData(d); setLoading(false); })
            .catch(e => {
                if (e.name !== "AbortError") { setError(e); setLoading(false); }
            });

        return () => controller.abort();
    }, [page, size, city, dateFrom, dateTo]);

    return { data, loading, error };
}

export async function fetchEventFilterOptions() {
    const r = await fetch(`${API_BASE}/api/v1/events/filter-options`);
    if (!r.ok) return { cities: [] };
    return r.json();
}
