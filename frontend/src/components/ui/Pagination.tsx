import styles from "./Pagination.module.css";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
    if (totalPages <= 1) return null;

    const pages = buildPageNumbers(currentPage, totalPages);

    return (
        <div className={styles.pagination}>
            <button
                className={styles.btn}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
            >
                ← Précédent
            </button>

            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`e${i}`} className={styles.ellipsis}>…</span>
                ) : (
                    <button
                        key={p}
                        className={`${styles.btn} ${p === currentPage ? styles.btnActive : ""}`}
                        onClick={() => onPageChange(p as number)}
                    >
                        {(p as number) + 1}
                    </button>
                )
            )}

            <button
                className={styles.btn}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
            >
                Suivant →
            </button>
        </div>
    );
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | "...")[] = [0];
    if (current > 2) pages.push("...");
    for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) pages.push(i);
    if (current < total - 3) pages.push("...");
    pages.push(total - 1);
    return pages;
}
