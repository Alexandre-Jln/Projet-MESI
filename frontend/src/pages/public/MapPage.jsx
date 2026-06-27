import { useState } from "react";
import Layout from "../../components/Layout";
import LeafletMap from "../../components/map/LeafletMap";
import { useMapData } from "../../hooks/useMapData";
import { useAssociations } from "../../hooks/useAssociations";
import styles from "./MapPage.module.css";

const BADGE_COLORS = {
    Solidarité:    { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    Environnement: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    Sport:         { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
    Culture:       { bg: "#fdf4ff", text: "#9333ea", border: "#e9d5ff" },
    Éducation:     { bg: "#fefce8", text: "#ca8a04", border: "#fde68a" },
    Santé:         { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" },
    Art:           { bg: "#fdf4ff", text: "#9333ea", border: "#e9d5ff" },
    Loisirs:       { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4" },
};

function getBadgeStyle(category) {
    return BADGE_COLORS[category] ?? { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };
}

const TABS = ["Associations", "Activités", "Projets"];

export default function MapPage() {
    const [activeTab, setActiveTab] = useState("Associations");

    const { associations: markers, events, loading: mapLoading } = useMapData();
    const { data, loading: listLoading } = useAssociations({ size: 200 });

    const associations = data?.content ?? [];
    const resultCount  = data?.totalElements ?? 0;

    return (
        <Layout>
            <div className={styles.container}>

                {/* ── Panneau gauche ── */}
                <div className={styles.panel}>
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

                    <div className={styles.listWrapper}>
                        {activeTab === "Associations" && (
                            <>
                                {listLoading ? (
                                    <p className={styles.loading}>Chargement…</p>
                                ) : (
                                    <>
                                        <span className={styles.resultCount}>
                                            {resultCount} résultat{resultCount > 1 ? "s" : ""}
                                        </span>
                                        <div className={styles.list}>
                                            {associations.map(assoc => {
                                                const badge = getBadgeStyle(assoc.category);
                                                return (
                                                    <div key={assoc.id} className={styles.card}>
                                                        <div className={styles.cardHeader}>
                                                            <h3 className={styles.cardName}>{assoc.name}</h3>
                                                            <span
                                                                className={styles.badge}
                                                                style={{
                                                                    background:   badge.bg,
                                                                    color:        badge.text,
                                                                    border:       `1px solid ${badge.border}`,
                                                                }}
                                                            >
                                                                {assoc.category}
                                                            </span>
                                                        </div>
                                                        <p className={styles.cardDesc}>{assoc.shortDescription}</p>
                                                        <p className={styles.cardCity}>{assoc.city}, France</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {activeTab !== "Associations" && (
                            <p className={styles.loading}>Bientôt disponible.</p>
                        )}
                    </div>
                </div>

                {/* ── Panneau carte ── */}
                <div className={styles.mapPanel}>
                    {!mapLoading && (
                        <LeafletMap associations={markers} events={events} />
                    )}
                </div>

            </div>
        </Layout>
    );
}
