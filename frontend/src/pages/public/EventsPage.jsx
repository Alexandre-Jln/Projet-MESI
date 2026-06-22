import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useEvents, fetchEventFilterOptions } from "../../hooks/useEvents";
import EventCard from "../../components/association/EventCard";
import EventFilters from "../../components/association/EventFilters";
import Pagination from "../../components/ui/Pagination";
import Layout from "../../components/Layout";
import styles from "../../css/EventsPage.module.css";

function todayIso() {
    return new Date().toISOString().split("T")[0];
}

export default function EventsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cities, setCities] = useState([]);

    const page     = Number(searchParams.get("page") ?? "0");
    const city     = searchParams.get("city") ?? "";
    const dateFrom = searchParams.get("dateFrom") ?? todayIso();
    const dateTo   = searchParams.get("dateTo") ?? "";

    const { data, loading, error } = useEvents({ page, size: 20, city, dateFrom, dateTo });

    useEffect(() => {
        fetchEventFilterOptions().then(({ cities }) => setCities(cities));
    }, []);

    const updateParam = useCallback((key, value) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value) next.set(key, value); else next.delete(key);
            next.set("page", "0");
            return next;
        });
    }, [setSearchParams]);

    const resetFilters = useCallback(() => {
        setSearchParams({ page: "0", dateFrom: todayIso() });
    }, [setSearchParams]);

    const goToPage = useCallback((p) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("page", String(p));
            return next;
        });
    }, [setSearchParams]);

    const totalElements = data?.totalElements ?? 0;

    return (
        <Layout>
            <div className={styles.page}>
                <div className={styles.filtersBar}>
                    <EventFilters
                        cities={cities}
                        city={city}
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={v => updateParam("dateFrom", v)}
                        onDateToChange={v => updateParam("dateTo", v)}
                        onCityChange={v => updateParam("city", v)}
                        onReset={resetFilters}
                    />
                </div>

                <div className={styles.content}>
                    <h2 className={styles.title}>
                        Événements à venir
                        {!loading && data && (
                            <span className={styles.count}>{totalElements} résultat{totalElements > 1 ? "s" : ""}</span>
                        )}
                    </h2>

                    {loading && <p className={styles.loading}>Chargement…</p>}

                    {error && (
                        <p className={styles.empty}>
                            Impossible de charger les événements. Vérifiez que le serveur est démarré.
                        </p>
                    )}

                    {data && !loading && !error && (
                        <>
                            {data.content.length === 0 ? (
                                <p className={styles.empty}>
                                    Aucun événement ne correspond à vos critères.
                                </p>
                            ) : (
                                <div className={styles.grid}>
                                    {data.content.map(event => (
                                        <EventCard key={event.id} event={event} />
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
