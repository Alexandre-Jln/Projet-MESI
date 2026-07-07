import styles from "../../css/EventCard.module.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const CATEGORY_GRADIENTS = {
    Sport:         "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
    Culture:       "linear-gradient(135deg, #2d1b4e 0%, #6b3fa0 100%)",
    Éducation:     "linear-gradient(135deg, #0d3b2e 0%, #1a7a5e 100%)",
    Environnement: "linear-gradient(135deg, #0d3326 0%, #1a6b4a 100%)",
    Solidarité:    "linear-gradient(135deg, #3b1f00 0%, #b35900 100%)",
    Santé:         "linear-gradient(135deg, #3b0d0d 0%, #9f2020 100%)",
    Art:           "linear-gradient(135deg, #3b0d2e 0%, #9f2070 100%)",
    Loisirs:       "linear-gradient(135deg, #2e2a00 0%, #7a6e00 100%)",
};

function formatDate(isoDate) {
    if (!isoDate) return "";
    return new Date(isoDate).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
    });
}

export default function EventCard({ event }) {
    const { name, releaseDt, duration, synopsis, associationName, associationCategorie, lieu, photoIds } = event;
    const gradient    = CATEGORY_GRADIENTS[associationCategorie] ?? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
    const initials    = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
    const firstPhoto  = photoIds?.[0] ? `${API_URL}/evenements/photos/${photoIds[0]}` : null;

    const city = lieu
        ? lieu.split(",").at(-1).replace(/^\d{5}\s*/, "").trim()
        : null;

    return (
        <div className={styles.card}>
            <div className={styles.banner} style={firstPhoto ? {} : { background: gradient }}>
                {firstPhoto
                    ? <img src={firstPhoto} alt={name} className={styles.bannerImg} />
                    : <span className={styles.initials}>{initials}</span>
                }
                {associationCategorie && (
                    <span className={styles.categoryBadge}>{associationCategorie}</span>
                )}
            </div>

            <div className={styles.body}>
                <h3 className={styles.name}>{name}</h3>

                <div className={styles.meta}>
                    <span className={styles.date}>📅 {formatDate(releaseDt)}</span>
                    {duration != null && (
                        <span className={styles.duration}>{duration} j.</span>
                    )}
                </div>

                {city && <span className={styles.lieu}>📍 {city}</span>}

                {associationName && (
                    <span className={styles.association}>par {associationName}</span>
                )}

                {synopsis && <p className={styles.synopsis}>{synopsis}</p>}
            </div>
        </div>
    );
}