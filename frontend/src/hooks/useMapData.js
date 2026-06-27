import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export function useMapData() {
    const [associations, setAssociations] = useState([]);
    const [events, setEvents]             = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/v1/associations/map`).then(r => r.json()),
            fetch(`${API_URL}/api/v1/events/map`).then(r => r.json()),
        ])
            .then(([assocData, eventData]) => {
                setAssociations(assocData);
                setEvents(eventData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return { associations, events, loading, error };
}
