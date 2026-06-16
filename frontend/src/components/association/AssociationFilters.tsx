import styles from "./AssociationFilters.module.css";

interface Props {
    categories: string[];
    cities: string[];
    category: string;
    city: string;
    search: string;
    onSearchChange: (value: string) => void;
    onChange: (key: "category" | "city", value: string) => void;
    onReset: () => void;
}

export default function AssociationFilters({
    categories, cities, category, city, search, onSearchChange, onChange, onReset,
}: Props) {
    const hasFilters = category !== "" || city !== "";

    return (
        <div className={styles.filters}>
            <div className={styles.searchWrapper}>
                <input
                    type="text"
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                    placeholder="Recherchez votre projet/association"
                    className={styles.searchInput}
                />
                <button className={styles.searchBtn} aria-label="Rechercher">🔍</button>
            </div>

            <div className={styles.filterRow}>
                <select
                    value={category}
                    onChange={e => onChange("category", e.target.value)}
                    className={styles.select}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    value={city}
                    onChange={e => onChange("city", e.target.value)}
                    className={styles.select}
                >
                    <option value="">Toutes les villes</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {hasFilters && (
                    <button onClick={onReset} className={styles.resetBtn}>
                        Réinitialiser
                    </button>
                )}
            </div>
        </div>
    );
}
