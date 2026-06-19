import type { AssociationSummary } from "../../hooks/useAssociations";
import styles from "./AssociationListItem.module.css";

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    Solidarité:    { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    Environnement: { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    Sport:         { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa" },
    Culture:       { bg: "#fdf4ff", text: "#9333ea", border: "#e9d5ff" },
    Éducation:     { bg: "#fefce8", text: "#ca8a04", border: "#fde68a" },
    Santé:         { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3" },
    Art:           { bg: "#fdf4ff", text: "#9333ea", border: "#e9d5ff" },
    Loisirs:       { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4" },
};

interface Props {
    association: AssociationSummary;
    isSelected: boolean;
    onClick: () => void;
}

export default function AssociationListItem({ association, isSelected, onClick }: Props) {
    const { name, shortDescription, category, city } = association;
    const badge = BADGE_COLORS[category] ?? { bg: "#f3f4f6", text: "#374151", border: "#e5e7eb" };

    return (
        <div
            className={`${styles.item} ${isSelected ? styles.itemSelected : ""}`}
            onClick={onClick}
        >
            <div className={styles.header}>
                <h3 className={styles.name}>{name}</h3>
                <span
                    className={styles.badge}
                    style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
                >
                    {category}
                </span>
            </div>
            <p className={styles.desc}>{shortDescription}</p>
            <p className={styles.city}>{city}, France</p>
        </div>
    );
}