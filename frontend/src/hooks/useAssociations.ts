import { useState, useEffect } from "react";

export interface AssociationSummary {
    id: number;
    name: string;
    shortDescription: string;
    category: string;
    city: string;
    lat?: number;
    lng?: number;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

interface Params {
    page?: number;
    size?: number;
    category?: string;
    city?: string;
    search?: string;
}

const MOCK_ASSOCIATIONS: AssociationSummary[] = [
    { id: 1,  name: "Les Coureurs de Lyon",              shortDescription: "Club de course à pied ouvert à tous les niveaux, du débutant au marathonien.",          category: "Sport",         city: "Lyon",       lat: 45.7640,  lng: 4.8357  },
    { id: 2,  name: "Basket Club Parisien",               shortDescription: "Association de basketball pour jeunes et adultes au cœur de Paris.",                    category: "Sport",         city: "Paris",      lat: 48.8566,  lng: 2.3522  },
    { id: 3,  name: "Théâtre en Herbe",                   shortDescription: "Troupe de théâtre amateur accueillant tous les passionnés de la scène.",                category: "Culture",       city: "Bordeaux",   lat: 44.8378,  lng: -0.5792 },
    { id: 4,  name: "Lectures Partagées",                 shortDescription: "Cercle de lecture mensuel autour de la littérature contemporaine et classique.",        category: "Culture",       city: "Nantes",     lat: 47.2184,  lng: -1.5536 },
    { id: 5,  name: "Code & Futur",                       shortDescription: "Initiation au code informatique pour les jeunes de 8 à 18 ans.",                        category: "Éducation",     city: "Paris",      lat: 48.8630,  lng: 2.3480  },
    { id: 6,  name: "Les Jardins Partagés de Marseille",  shortDescription: "Création et animation de jardins collectifs en milieu urbain.",                         category: "Environnement", city: "Marseille",  lat: 43.2965,  lng: 5.3698  },
    { id: 7,  name: "Solidarité Toulouse",                shortDescription: "Aide alimentaire et sociale aux familles en difficulté.",                               category: "Solidarité",    city: "Toulouse",   lat: 43.6047,  lng: 1.4442  },
    { id: 8,  name: "Atelier Peinture Libre",             shortDescription: "Espace créatif pour peindre ensemble, toutes techniques bienvenues.",                   category: "Art",           city: "Lyon",       lat: 45.7500,  lng: 4.8450  },
    { id: 9,  name: "Yoga & Bien-être Bordeaux",          shortDescription: "Cours de yoga et méditation pour tous les niveaux.",                                    category: "Santé",         city: "Bordeaux",   lat: 44.8420,  lng: -0.5720 },
    { id: 10, name: "Les Randonneurs Niçois",             shortDescription: "Organisation de randonnées pédestres autour de Nice et l'arrière-pays.",                category: "Sport",         city: "Nice",       lat: 43.7102,  lng: 7.2620  },
    { id: 11, name: "Musique à Strasbourg",               shortDescription: "Ensemble musical amateur jouant de la musique de chambre et orchestrale.",              category: "Culture",       city: "Strasbourg", lat: 48.5734,  lng: 7.7521  },
    { id: 12, name: "Secours Populaire de Lille",         shortDescription: "Distribution de vêtements et repas chauds aux personnes en précarité.",                 category: "Solidarité",    city: "Lille",      lat: 50.6292,  lng: 3.0573  },
    { id: 13, name: "Vélo Urbain Rennais",                shortDescription: "Promotion du vélo comme mode de transport quotidien à Rennes.",                         category: "Environnement", city: "Rennes",     lat: 48.1173,  lng: -1.6778 },
    { id: 14, name: "Scrabble Club de Nantes",            shortDescription: "Tournois et entraînements de scrabble pour tous les niveaux.",                          category: "Loisirs",       city: "Nantes",     lat: 47.2100,  lng: -1.5600 },
    { id: 15, name: "Cinéma Autrement",                   shortDescription: "Projections et débats autour du cinéma indépendant et mondial.",                        category: "Culture",       city: "Paris",      lat: 48.8700,  lng: 2.3400  },
    { id: 16, name: "Foot Pour Tous",                     shortDescription: "Club de football inclusif accueillant personnes valides et handicapées.",               category: "Sport",         city: "Marseille",  lat: 43.3000,  lng: 5.3800  },
    { id: 17, name: "Potager Collectif Lyon",             shortDescription: "Gestion d'un potager partagé en cœur de ville, ouvert à tous.",                        category: "Environnement", city: "Lyon",       lat: 45.7700,  lng: 4.8200  },
    { id: 18, name: "Aide aux Devoirs",                   shortDescription: "Soutien scolaire bénévole pour collégiens et lycéens en difficulté.",                   category: "Éducation",     city: "Toulouse",   lat: 43.6100,  lng: 1.4500  },
    { id: 19, name: "Aquarelle et Encre",                 shortDescription: "Ateliers hebdomadaires d'aquarelle pour débutants et confirmés.",                       category: "Art",           city: "Strasbourg", lat: 48.5800,  lng: 7.7450  },
    { id: 20, name: "Marche Nordique Paris",              shortDescription: "Randonnées nordiques dans les parcs et forêts d'Île-de-France.",                        category: "Sport",         city: "Paris",      lat: 48.8480,  lng: 2.3600  },
    { id: 21, name: "Les Amis du Livre",                  shortDescription: "Bibliothèque participative et ateliers d'écriture créative.",                           category: "Culture",       city: "Lille",      lat: 50.6350,  lng: 3.0620  },
    { id: 22, name: "Secours Sans Frontières Bordeaux",   shortDescription: "Collecte et distribution de matériel scolaire pour enfants défavorisés.",              category: "Solidarité",    city: "Bordeaux",   lat: 44.8300,  lng: -0.5850 },
    { id: 23, name: "Nantes Propre",                      shortDescription: "Actions de sensibilisation et nettoyage de l'environnement urbain.",                    category: "Environnement", city: "Nantes",     lat: 47.2250,  lng: -1.5450 },
    { id: 24, name: "Danse Contemporaine Marseille",      shortDescription: "Cours de danse contemporaine et création chorégraphique collective.",                   category: "Art",           city: "Marseille",  lat: 43.2900,  lng: 5.3750  },
    { id: 25, name: "Seniors Connectés",                  shortDescription: "Initiation numérique et accompagnement des personnes âgées.",                           category: "Éducation",     city: "Nice",       lat: 43.7050,  lng: 7.2680  },
];

export function useAssociations({ page = 0, size = 20, category = "", city = "", search = "" }: Params = {}) {
    const [data, setData] = useState<Page<AssociationSummary> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            let filtered = MOCK_ASSOCIATIONS;
            if (category) filtered = filtered.filter(a => a.category === category);
            if (city)     filtered = filtered.filter(a => a.city === city);
            if (search)   filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(search.toLowerCase()) ||
                a.shortDescription.toLowerCase().includes(search.toLowerCase())
            );

            const totalElements = filtered.length;
            const totalPages = Math.max(1, Math.ceil(totalElements / size));
            const safePage = Math.min(page, totalPages - 1);
            const content = filtered.slice(safePage * size, safePage * size + size);

            setData({ content, totalPages, totalElements, number: safePage, size });
            setLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }, [page, size, category, city, search]);

    return { data, loading, error: null };
}

export async function fetchFilterOptions(): Promise<{ categories: string[]; cities: string[] }> {
    const categories = [...new Set(MOCK_ASSOCIATIONS.map(a => a.category))].sort();
    const cities     = [...new Set(MOCK_ASSOCIATIONS.map(a => a.city))].sort();
    return { categories, cities };
}
