import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAssociations, fetchFilterOptions, type AssociationSummary } from "../../hooks/useAssociations";
import AssociationCard from "../../components/association/AssociationCard";
import AssociationListItem from "../../components/association/AssociationListItem";
import AssociationFilters from "../../components/association/AssociationFilters";
import Pagination from "../../components/ui/Pagination";
import LeafletMap from "../../components/map/LeafletMap";
import Layout from "../../components/Layout";
import styles from "./AssociationsPage.module.css";

const TABS = ["Associations", "Activités", "Projets"] as const;

export default function AssociationsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selected, setSelected]         = useState<AssociationSummary | null>(null);
    const [activeTab, setActiveTab]       = useState<string>("Associations");

    const page     = Number(searchParams.get("page") ?? "0");
    const category = searchParams.get("category") ?? "";
    const city     = searchParams.get("city") ?? "";
    const search   = searchParams.get("search") ?? "";

    // Vue grille : paginée (20 par page), respecte les filtres
    const { data, loading } = useAssociations({ page, size: 20, category, city, search });

    // Vue split et carte : toutes les associations filtrées (jusqu'à 200), respecte les filtres
    const filteredAll = useAssociations({ size: 200, category, city, search });

    const [categories, setCategories] = useState<string[]>([]);
    const [cities, setCities]         = useState<string[]>([]);

    useEffect(() => {
        fetchFilterOptions().then(({ categories, cities }) => {
            setCategories(categories);
            setCities(cities);
        });
    }, []);

    const updateFilter = useCallback((key: "category" | "city", value: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value); else next.delete(key);
            next.set("page", "0");
            return next;
        });
    }, [setSearchParams]);

    const updateSearch = useCallback((value: string) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value) next.set("search", value); else next.delete("search");
            next.set("page", "0");
            return next;
        });
    }, [setSearchParams]);

    const resetFilters = useCallback(() => {
        setSearchParams({ page: "0" });
    }, [setSearchParams]);

    const goToPage = useCallback((p: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("page", String(p));
            return next;
        });
    }, [setSearchParams]);

    const handleSelectAssociation = (assoc: AssociationSummary) => {
        setSelected(assoc);
        setActiveTab("Associations");
    };

    const handleClose = () => setSelected(null);

    // Marqueurs carte : associations filtrées avec coordonnées
    const mapMarkers = (filteredAll.data?.content ?? [])
        .filter(a => a.lat != null && a.lng != null)
        .map(a => ({ id: a.id, name: a.name, lat: a.lat!, lng: a.lng!, city: a.city }));

    const center: [number, number] | null =
        selected?.lat != null && selected?.lng != null
            ? [selected.lat, selected.lng]
            : null;

    const filtersBar = (
        <div className={styles.filtersBar}>
            <AssociationFilters
                categories={categories}
                cities={cities}
                category={category}
                city={city}
                search={search}
                onSearchChange={updateSearch}
                onChange={updateFilter}
                onReset={resetFilters}
            />
        </div>
    );

    // ── Vue split (association sélectionnée) ─────────────────────────────────
    if (selected) {
        const listData    = filteredAll.data?.content ?? [];
        const resultCount = filteredAll.data?.totalElements ?? 0;

        return (
            <Layout>
                <div className={styles.splitWrapper}>
                    {filtersBar}

                    <div className={styles.splitContainer}>
                        {/* Panneau gauche — masqué sur mobile */}
                        <div className={styles.splitLeft}>
                            <div className={styles.tabs}>
                                {TABS.map(tab => (
                                    <button
                                        key={tab}
                                        className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className={styles.splitListWrapper}>
                                {activeTab === "Associations" && (
                                    <>
                                        <span className={styles.resultCount}>
                                            {resultCount} résultat{resultCount > 1 ? "s" : ""}
                                        </span>
                                        <div className={styles.splitList}>
                                            {listData.map(assoc => (
                                                <AssociationListItem
                                                    key={assoc.id}
                                                    association={assoc}
                                                    isSelected={assoc.id === selected.id}
                                                    onClick={() => setSelected(assoc)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                                {activeTab !== "Associations" && (
                                    <p className={styles.tabPlaceholder}>Bientôt disponible.</p>
                                )}
                            </div>
                        </div>

                        {/* Panneau droit — carte */}
                        <div className={styles.splitRight}>
                            <button className={styles.closeBtn} onClick={handleClose} aria-label="Fermer la carte">
                                ✕
                            </button>
                            <LeafletMap
                                associations={mapMarkers}
                                center={center}
                                selectedId={selected.id}
                            />
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // ── Vue normale (grille + filtres) ────────────────────────────────────────
    return (
        <Layout>
            <div className={styles.page}>
                {filtersBar}

                <div className={styles.content}>
                    <h2 className={styles.title}>Résultats de recherche</h2>

                    {loading && <p className={styles.loading}>Chargement…</p>}

                    {data && !loading && (
                        <>
                            {data.content.length === 0 ? (
                                <p className={styles.empty}>
                                    Aucune association ne correspond à votre recherche.
                                </p>
                            ) : (
                                <div className={styles.grid}>
                                    {data.content.map(assoc => (
                                        <AssociationCard
                                            key={assoc.id}
                                            association={assoc}
                                            onClick={() => handleSelectAssociation(assoc)}
                                        />
                                    ))}
                                </div>
                            )}

                            <Pagination
                                currentPage={data.number}
                                totalPages={data.totalPages}
                                onPageChange={goToPage}
                            />
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}
