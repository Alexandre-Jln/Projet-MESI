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
 * @property {string}  associationCategorie
 * @property {string}  lieu
 * @property {number}  latitude
 * @property {number}  longitude
 */

const MOCK_EVENTS = [
    // Les Restos du Cœur — Aide alimentaire
    { id: 3,  name: "Collecte de rentrée 2026",         releaseDt: "2026-07-01", duration: 30, associationId: 1, associationName: "Les Restos du Cœur",       associationCategorie: "Aide alimentaire", lieu: "75 rue Nationale, 75013 Paris",         synopsis: "Grande collecte de denrées non périssables dans les supermarchés partenaires de toute la région parisienne.", latitude: 48.8566, longitude: 2.3522 },
    { id: 4,  name: "Atelier cuisine anti-gaspillage",  releaseDt: "2026-08-10", duration: 7,  associationId: 1, associationName: "Les Restos du Cœur",       associationCategorie: "Aide alimentaire", lieu: "75 rue Nationale, 75013 Paris",         synopsis: "Ateliers pratiques pour apprendre à cuisiner des repas équilibrés avec des ingrédients simples et peu coûteux.", latitude: 48.8510, longitude: 2.3600 },
    { id: 5,  name: "Gala de bienfaisance automne",     releaseDt: "2026-09-15", duration: 1,  associationId: 1, associationName: "Les Restos du Cœur",       associationCategorie: "Aide alimentaire", lieu: "75 rue Nationale, 75013 Paris",         synopsis: "Soirée annuelle de levée de fonds avec vente aux enchères, concert et dîner au profit des familles en difficulté.", latitude: 48.8566, longitude: 2.3522 },
    { id: 6,  name: "Marché solidaire de Noël",         releaseDt: "2026-11-28", duration: 30, associationId: 1, associationName: "Les Restos du Cœur",       associationCategorie: "Aide alimentaire", lieu: "75 rue Nationale, 75013 Paris",         synopsis: "Marché de Noël associatif avec produits artisanaux, tombola et animations pour soutenir nos actions alimentaires.", latitude: 48.8480, longitude: 2.3520 },

    // Greenpeace France — Environnement
    { id: 7,  name: "Nettoyage des berges de la Seine", releaseDt: "2026-07-12", duration: 1,  associationId: 2, associationName: "Greenpeace France",         associationCategorie: "Environnement",    lieu: "13 rue Enghien, 75010 Paris",          synopsis: "Action citoyenne de dépollution des rives de la Seine. Matériel fourni, inscription obligatoire.", latitude: 48.8584, longitude: 2.2945 },
    { id: 8,  name: "Marche pour le Climat Paris 2026", releaseDt: "2026-09-20", duration: 1,  associationId: 2, associationName: "Greenpeace France",         associationCategorie: "Environnement",    lieu: "13 rue Enghien, 75010 Paris",          synopsis: "Manifestation nationale pour une politique climatique ambitieuse et la sortie des énergies fossiles.", latitude: 48.8566, longitude: 2.3522 },
    { id: 9,  name: "Forum écologie urbaine",           releaseDt: "2026-10-05", duration: 3,  associationId: 2, associationName: "Greenpeace France",         associationCategorie: "Environnement",    lieu: "13 rue Enghien, 75010 Paris",          synopsis: "Trois jours de conférences, ateliers et débats autour de la ville durable, mobilités vertes et éco-conception.", latitude: 48.8738, longitude: 2.3506 },
    { id: 10, name: "Journée zéro déchet Paris",        releaseDt: "2026-11-08", duration: 1,  associationId: 2, associationName: "Greenpeace France",         associationCategorie: "Environnement",    lieu: "13 rue Enghien, 75010 Paris",          synopsis: "Sensibilisation au tri, au compostage et à la réduction des déchets dans nos quartiers. Stands et démonstrations.", latitude: 48.8566, longitude: 2.3522 },

    // Croix-Rouge Française — Aide humanitaire
    { id: 11, name: "Formation premiers secours",             releaseDt: "2026-07-20", duration: 2,  associationId: 3, associationName: "Croix-Rouge Française",     associationCategorie: "Aide humanitaire", lieu: "98 rue Didot, 75014 Paris",            synopsis: "Stage PSC1 ouvert à tous. Apprenez les gestes qui sauvent en 7 heures de formation théorique et pratique.", latitude: 48.8282, longitude: 2.3173 },
    { id: 12, name: "Concert caritatif Solidarité 2026",      releaseDt: "2026-08-25", duration: 1,  associationId: 3, associationName: "Croix-Rouge Française",     associationCategorie: "Aide humanitaire", lieu: "98 rue Didot, 75014 Paris",            synopsis: "Concert de musique classique et jazz au bénéfice des victimes de catastrophes. Entrée sur don libre.", latitude: 48.8590, longitude: 2.3460 },
    { id: 13, name: "Journée portes ouvertes Croix-Rouge",    releaseDt: "2026-09-05", duration: 1,  associationId: 3, associationName: "Croix-Rouge Française",     associationCategorie: "Aide humanitaire", lieu: "98 rue Didot, 75014 Paris",            synopsis: "Découvrez nos équipes, nos missions locales et comment devenir bénévole. Démonstrations de secourisme incluses.", latitude: 48.8282, longitude: 2.3173 },
    { id: 14, name: "Collecte de sang – semaine nationale",   releaseDt: "2026-10-14", duration: 14, associationId: 3, associationName: "Croix-Rouge Française",     associationCategorie: "Aide humanitaire", lieu: "98 rue Didot, 75014 Paris",            synopsis: "Points de collecte de sang dans toute la ville. Chaque don peut sauver jusqu'à trois vies.", latitude: 48.8282, longitude: 2.3173 },

    // Médecins Sans Frontières — Santé
    { id: 16, name: "Conférence urgences sanitaires mondiales",      releaseDt: "2026-08-28", duration: 1,  associationId: 4, associationName: "Médecins Sans Frontières", associationCategorie: "Santé",            lieu: "14-34 avenue Jean Jaurès, 75019 Paris", synopsis: "Témoignages de médecins de retour de mission sur l'accès aux soins en zones de guerre et d'épidémie.", latitude: 48.8793, longitude: 2.3719 },
    { id: 15, name: "Expo humanitaire – Soigner sans frontières",    releaseDt: "2026-09-10", duration: 21, associationId: 4, associationName: "Médecins Sans Frontières", associationCategorie: "Santé",            lieu: "14-34 avenue Jean Jaurès, 75019 Paris", synopsis: "Exposition photographique immersive sur les missions MSF dans les zones de conflit et catastrophes naturelles.", latitude: 48.8793, longitude: 2.3719 },
    { id: 17, name: "Marché solidaire MSF – Décembre",              releaseDt: "2026-12-05", duration: 7,  associationId: 4, associationName: "Médecins Sans Frontières", associationCategorie: "Santé",            lieu: "14-34 avenue Jean Jaurès, 75019 Paris", synopsis: "Marché de fin d'année avec objets artisanaux rapportés par les équipes MSF et produits du commerce équitable.", latitude: 48.8793, longitude: 2.3719 },

    // WWF France — Environnement
    { id: 18, name: "Nettoyage du Bois de Boulogne",   releaseDt: "2026-07-05", duration: 1,  associationId: 5, associationName: "WWF France",                associationCategorie: "Environnement",    lieu: "1 carrefour de Longchamp, 75016 Paris", synopsis: "Collecte de déchets dans le Bois de Boulogne avec les bénévoles WWF. Matériel de collecte fourni sur place.", latitude: 48.8615, longitude: 2.2522 },
    { id: 19, name: "Journée mondiale des océans",      releaseDt: "2026-07-28", duration: 1,  associationId: 5, associationName: "WWF France",                associationCategorie: "Environnement",    lieu: "1 carrefour de Longchamp, 75016 Paris", synopsis: "Conférences, projections et ateliers pour sensibiliser à la protection des océans et de la vie marine.", latitude: 48.8615, longitude: 2.2522 },
    { id: 20, name: "Exposition biodiversité en danger", releaseDt: "2026-10-01", duration: 30, associationId: 5, associationName: "WWF France",                associationCategorie: "Environnement",    lieu: "1 carrefour de Longchamp, 75016 Paris", synopsis: "Grande exposition photographique sur les espèces menacées. Intervenants scientifiques tout au long du mois.", latitude: 48.8615, longitude: 2.2522 },

    // Ligue contre le Cancer — Santé
    { id: 21, name: "Octobre Rose – Marche solidaire",  releaseDt: "2026-10-01", duration: 31, associationId: 6, associationName: "Ligue contre le Cancer",    associationCategorie: "Santé",            lieu: "14 rue Corvisart, 75013 Paris",         synopsis: "Un mois de mobilisation pour la recherche contre le cancer du sein. Marches, conférences et dépistages gratuits.", latitude: 48.8278, longitude: 2.3511 },
    { id: 22, name: "Conférence prévention des cancers", releaseDt: "2026-11-18", duration: 1,  associationId: 6, associationName: "Ligue contre le Cancer",    associationCategorie: "Santé",            lieu: "14 rue Corvisart, 75013 Paris",         synopsis: "Conférence médicale grand public sur le dépistage précoce, les facteurs de risque et les avancées thérapeutiques.", latitude: 48.8278, longitude: 2.3511 },
];

function applyFiltersAndPaginate(events, { page, size, city, dateFrom, dateTo }) {
    let filtered = events;
    if (dateFrom) filtered = filtered.filter(e => e.releaseDt >= dateFrom);
    if (dateTo)   filtered = filtered.filter(e => e.releaseDt <= dateTo);
    if (city)     filtered = filtered.filter(e =>
        (e.lieu ?? e.associationName ?? "").toLowerCase().includes(city.toLowerCase())
    );
    const totalElements = filtered.length;
    const totalPages    = Math.max(1, Math.ceil(totalElements / size));
    const safePage      = Math.min(page, totalPages - 1);
    const content       = filtered.slice(safePage * size, safePage * size + size);
    return { content, totalPages, totalElements, number: safePage, size };
}

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
                setData(applyFiltersAndPaginate(events, { page, size, city, dateFrom, dateTo }));
                setLoading(false);
            })
            .catch(() => {
                // Fallback sur les données de mock si le backend est inaccessible
                setData(applyFiltersAndPaginate(MOCK_EVENTS, { page, size, city, dateFrom, dateTo }));
                setError(null);
                setLoading(false);
            });
    }, [page, size, city, dateFrom, dateTo]);

    return { data, loading, error };
}

export function fetchEventFilterOptions() {
    return fetch(`${API_URL}/evenements/read`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(events => {
            const cities = [...new Set(events
                .map(e => e.lieu)
                .filter(Boolean)
                .map(lieu => {
                    const parts = lieu.split(",");
                    return parts[parts.length - 1].replace(/^\d{5}\s*/, "").trim();
                })
            )].sort();
            return { cities };
        })
        .catch(() => {
            // Fallback mock cities
            const cities = [...new Set(MOCK_EVENTS.map(e => {
                const parts = e.lieu.split(",");
                return parts[parts.length - 1].replace(/^\d{5}\s*/, "").trim();
            }))].sort();
            return { cities };
        });
}
