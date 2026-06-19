import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import "../css/Cagnotte.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8082";

export default function Cagnottes() {
    const [cagnottes, setCagnottes] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [erreur, setErreur]       = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/api/cagnottes`)
            .then(r => r.json())
            .then(data => { setCagnottes(data); setLoading(false); })
            .catch(() => { setErreur("Impossible de charger les cagnottes."); setLoading(false); });
    }, []);

    const progression = (c) =>
        c.objectif ? Math.min(100, Math.round((c.montantCollecte / c.objectif) * 100)) : null;

    return (
        <>
            <Header />
            <main className="cagnottes-page">
                <div className="cagnottes-header">
                    <h1>Cagnottes</h1>
                    <Link to="/cagnottes/creer" className="btn-creer">+ Créer une cagnotte</Link>
                </div>

                {loading && <p className="cagnotte-message">Chargement…</p>}
                {erreur  && <p className="cagnotte-message erreur">{erreur}</p>}

                <div className="cagnottes-grid">
                    {cagnottes.map(c => (
                        <Link to={`/cagnottes/${c.id}`} key={c.id} className="cagnotte-card">
                            <h2>{c.titre}</h2>
                            <p className="cagnotte-desc">{c.description}</p>

                            {progression(c) !== null && (
                                <div className="cagnotte-progress">
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${progression(c)}%` }} />
                                    </div>
                                    <span className="progress-label">
                                        {progression(c)}% — {c.montantCollecte.toFixed(2)} € / {c.objectif.toFixed(2)} €
                                    </span>
                                </div>
                            )}

                            {!c.objectif && (
                                <p className="cagnotte-collecte">{c.montantCollecte.toFixed(2)} € collectés</p>
                            )}

                            {c.dateFin && (
                                <p className="cagnotte-fin">
                                    Jusqu'au {new Date(c.dateFin).toLocaleDateString("fr-FR")}
                                </p>
                            )}
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}
