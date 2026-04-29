import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAssociations, fetchFilterOptions } from "../../hooks/useAssociations";
import AssociationCard from "../../components/association/AssociationCard";
import AssociationFilters from "../../components/association/AssociationFilters";
import Pagination from "../../components/ui/Pagination";
import styles from "./AssociationsPage.module.css";

export default function AssociationsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page     = Number(searchParams.get("page") ?? "0");
    const category = searchParams.get("category") ?? "";
    const city     = searchParams.get("city") ?? "";
    const search   = searchParams.get("search") ?? "";

    const { data, loading } = useAssociations({ page, size: 20, category, city, search });

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

    return (
        <div className={styles.page}>
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
                                    <AssociationCard key={assoc.id} association={assoc} />
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
    );
}
