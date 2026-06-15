import type { AssociationSummary } from "../../hooks/useAssociations";
import styles from "./AssociationCard.module.css";

const CATEGORY_GRADIENTS: Record<string, string> = {
    Sport:          "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
    Culture:        "linear-gradient(135deg, #2d1b4e 0%, #6b3fa0 100%)",
    Éducation:      "linear-gradient(135deg, #0d3b2e 0%, #1a7a5e 100%)",
    Environnement:  "linear-gradient(135deg, #0d3326 0%, #1a6b4a 100%)",
    Solidarité:     "linear-gradient(135deg, #3b1f00 0%, #b35900 100%)",
    Santé:          "linear-gradient(135deg, #3b0d0d 0%, #9f2020 100%)",
    Art:            "linear-gradient(135deg, #3b0d2e 0%, #9f2070 100%)",
    Loisirs:        "linear-gradient(135deg, #2e2a00 0%, #7a6e00 100%)",
};

interface Props {
    association: AssociationSummary;
    onClick?: () => void;
}

export default function AssociationCard({ association, onClick }: Props) {
    const { name, shortDescription, category, city } = association;
    const gradient = CATEGORY_GRADIENTS[category] ?? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)";
    const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

    return (
        <div className={styles.card} onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
            <div className={styles.banner} style={{ background: gradient }}>
                <span className={styles.initials}>{initials}</span>
                <span className={styles.categoryBadge}>{category}</span>
            </div>

            <div className={styles.body}>
                <div className={styles.header}>
                    <h3 className={styles.name}>{name}</h3>
                    <span className={styles.city}>📍 {city}</span>
                </div>
                <p className={styles.description}>{shortDescription}</p>
            </div>
        </div>
    );
}
