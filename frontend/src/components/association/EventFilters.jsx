import styles from "../../css/EventFilters.module.css";

export default function EventFilters({
    cities,
    city,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    onCityChange,
    onReset,
}) {
    const hasFilters = city !== "" || dateTo !== "";

    return (
        <div className={styles.filters}>
            <div className={styles.filterRow}>
                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="dateFrom">À partir du</label>
                    <input
                        id="dateFrom"
                        type="date"
                        value={dateFrom}
                        onChange={e => onDateFromChange(e.target.value)}
                        className={styles.dateInput}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="dateTo">Jusqu&apos;au</label>
                    <input
                        id="dateTo"
                        type="date"
                        value={dateTo}
                        min={dateFrom}
                        onChange={e => onDateToChange(e.target.value)}
                        className={styles.dateInput}
                    />
                </div>

                <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="city">Ville</label>
                    <select
                        id="city"
                        value={city}
                        onChange={e => onCityChange(e.target.value)}
                        className={styles.select}
                    >
                        <option value="">Toutes les villes</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {hasFilters && (
                    <button onClick={onReset} className={styles.resetBtn}>
                        Réinitialiser
                    </button>
                )}
            </div>
        </div>
    );
}