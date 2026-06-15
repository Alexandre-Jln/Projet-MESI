import { useState, useEffect } from "react";
import "../css/AssociationAuth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const STATUT_LABEL = {
    PENDING:   { label: "En attente",  color: "#f59e0b" },
    VALIDATED: { label: "Validée",     color: "#16a34a" },
    REJECTED:  { label: "Rejetée",     color: "#dc2626" },
};

export default function AdminAssociations() {
    const [associations, setAssociations] = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [filtre,       setFiltre]       = useState("PENDING");
    const [motifRejet,   setMotifRejet]   = useState({});
    const [message,      setMessage]      = useState(null);

    const charger = () => {
        setLoading(true);
        const url = filtre === "TOUTES"
            ? `${API_URL}/api/associations/admin/toutes`
            : `${API_URL}/api/associations/admin/en-attente`;

        fetch(url)
            .then(r => r.json())
            .then(data => { setAssociations(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { charger(); }, [filtre]);

    const valider = async (id) => {
        const res = await fetch(`${API_URL}/api/associations/${id}/valider`, { method: "PUT" });
        if (res.ok) {
            setMessage("Association validée ✓");
            charger();
        }
    };

    const rejeter = async (id) => {
        const motif = motifRejet[id] ?? "";
        const res = await fetch(`${API_URL}/api/associations/${id}/rejeter`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ motif }),
        });
        if (res.ok) {
            setMessage("Association rejetée.");
            charger();
        }
    };

    const affichees = filtre === "TOUTES"
        ? associations
        : associations.filter(a => a.statut === filtre);

    return (
        <main className="admin-page">
            <div className="admin-header">
                <h1>Administration — Comptes associations</h1>
                <div className="admin-filtres">
                    {["PENDING", "VALIDATED", "REJECTED", "TOUTES"].map(f => (
                        <button key={f}
                            className={`admin-filtre-btn ${filtre === f ? "actif" : ""}`}
                            onClick={() => setFiltre(f)}>
                            {f === "PENDING"    ? "En attente"
                           : f === "VALIDATED"  ? "Validées"
                           : f === "REJECTED"   ? "Rejetées"
                                                : "Toutes"}
                        </button>
                    ))}
                </div>
            </div>

            {message && (
                <div className="admin-message" onClick={() => setMessage(null)}>
                    {message} <span style={{opacity:.5, fontSize:".8em"}}>(cliquer pour fermer)</span>
                </div>
            )}

            {loading && <p style={{padding:"2rem", color:"#6b7280"}}>Chargement…</p>}

            {!loading && affichees.length === 0 && (
                <p style={{padding:"2rem", color:"#6b7280"}}>Aucune association dans cette catégorie.</p>
            )}

            <div className="admin-list">
                {affichees.map(a => {
                    const st = STATUT_LABEL[a.statut] ?? { label: a.statut, color: "#999" };
                    return (
                        <div key={a.id} className="admin-card">
                            <div className="admin-card__header">
                                <div>
                                    <h2 className="admin-card__nom">{a.nom}</h2>
                                    <span className="admin-card__siret">SIRET : {a.siret}</span>
                                </div>
                                <span className="admin-card__statut" style={{ color: st.color }}>
                                    ● {st.label}
                                </span>
                            </div>

                            <div className="admin-card__infos">
                                <span>📧 {a.email}</span>
                                {a.telephone && <span>📞 {a.telephone}</span>}
                                {a.siegeSocial && <span>📍 {a.siegeSocial}</span>}
                                {a.dateInscription && (
                                    <span>📅 Inscrite le {new Date(a.dateInscription).toLocaleDateString("fr-FR")}</span>
                                )}
                            </div>

                            {a.description && (
                                <p className="admin-card__desc">{a.description}</p>
                            )}

                            {a.motifRejet && (
                                <p className="admin-card__motif">Motif : {a.motifRejet}</p>
                            )}

                            {a.statut === "PENDING" && (
                                <div className="admin-card__actions">
                                    <button
                                        className="admin-btn admin-btn--valider"
                                        onClick={() => valider(a.id)}>
                                        ✓ Valider
                                    </button>
                                    <div className="admin-reject-group">
                                        <input
                                            type="text"
                                            placeholder="Motif du rejet (optionnel)"
                                            className="admin-motif-input"
                                            value={motifRejet[a.id] ?? ""}
                                            onChange={e => setMotifRejet(m => ({
                                                ...m, [a.id]: e.target.value
                                            }))}
                                        />
                                        <button
                                            className="admin-btn admin-btn--rejeter"
                                            onClick={() => rejeter(a.id)}>
                                            ✕ Rejeter
                                        </button>
                                    </div>
                                </div>
                            )}

                            {a.statut === "VALIDATED" && (
                                <div className="admin-card__actions">
                                    <button
                                        className="admin-btn admin-btn--rejeter"
                                        onClick={() => rejeter(a.id)}>
                                        Révoquer l'accès
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
