import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import "../css/Cagnotte.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function CreateCagnotte() {
    const navigate = useNavigate();

    // Récupère la session association depuis le sessionStorage
    const [session, setSession]   = useState(null);
    const [sessionOk, setSessionOk] = useState(false);

    const [associations, setAssociations] = useState([]);
    const [form, setForm] = useState({
        titre: "", description: "", objectif: "", associationId: "", dateFin: ""
    });
    const [erreurs,   setErreurs]   = useState({});
    const [loading,   setLoading]   = useState(false);
    const [erreurApi, setErreurApi] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem("assoc_session");
        if (raw) {
            const sess = JSON.parse(raw);
            setSession(sess);
            if (sess.statut === "VALIDATED") {
                setSessionOk(true);
                setForm(f => ({ ...f, associationId: String(sess.id) }));
            }
        }

        // On charge quand même les associations pour le select (au cas où)
        fetch(`${API_URL}/api/associations`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setAssociations(Array.isArray(data) ? data : []))
            .catch(() => setAssociations([]));
    }, []);

    const changer = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErreurs(err => ({ ...err, [e.target.name]: null }));
    };

    const valider = () => {
        const e = {};
        if (!form.titre.trim())     e.titre         = "Le titre est obligatoire.";
        if (!form.associationId)    e.associationId = "Choisissez une association.";
        if (form.objectif && isNaN(parseFloat(form.objectif))) e.objectif = "Montant invalide.";
        return e;
    };

    const soumettre = async (e) => {
        e.preventDefault();
        const e2 = valider();
        if (Object.keys(e2).length) { setErreurs(e2); return; }

        setLoading(true);
        setErreurApi(null);

        const body = {
            titre:         form.titre,
            description:   form.description || null,
            objectif:      form.objectif ? parseFloat(form.objectif) : null,
            associationId: parseInt(form.associationId),
            dateFin:       form.dateFin || null,
        };

        try {
            const res = await fetch(`${API_URL}/api/cagnottes`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setErreurApi(data.error ?? (data.errors
                    ? Object.values(data.errors).join(" — ")
                    : "Erreur serveur."));
                return;
            }
            const cagnotte = await res.json();
            navigate(`/cagnottes/${cagnotte.id}`);
        } catch {
            setErreurApi("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    // ── Écrans de garde ────────────────────────────────────────────────

    if (!session) {
        return (
            <>
                <Header />
                <main className="cagnotte-form-page">
                    <div className="cagnotte-form-card" style={{ textAlign: "center" }}>
                        <h1 style={{ marginBottom: "1rem" }}>Accès réservé</h1>
                        <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                            Seules les associations inscrites et validées peuvent créer une cagnotte.
                        </p>
                        <Link to="/associations/login" className="btn-submit"
                              style={{ display:"inline-block", textDecoration:"none", maxWidth:"280px" }}>
                            Connexion espace association
                        </Link>
                        <p style={{ marginTop: "1rem", fontSize: ".88rem", color: "#9ca3af" }}>
                            Pas encore inscrit ? <Link to="/associations/register">Inscrire mon association</Link>
                        </p>
                    </div>
                </main>
            </>
        );
    }

    if (session.statut === "PENDING") {
        return (
            <>
                <Header />
                <main className="cagnotte-form-page">
                    <div className="cagnotte-form-card" style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "2rem" }}>⏳</span>
                        <h1 style={{ margin: "1rem 0 .5rem" }}>Compte en attente</h1>
                        <p style={{ color: "#6b7280" }}>
                            Votre association <strong>{session.nom}</strong> est en cours de vérification.
                            Notre équipe valide votre compte sous 24 à 48h.
                        </p>
                        <p style={{ color: "#9ca3af", fontSize: ".85rem", marginTop: ".75rem" }}>
                            Une fois validée, vous pourrez créer vos cagnottes ici.
                        </p>
                    </div>
                </main>
            </>
        );
    }

    if (session.statut === "REJECTED") {
        return (
            <>
                <Header />
                <main className="cagnotte-form-page">
                    <div className="cagnotte-form-card" style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "2rem" }}>❌</span>
                        <h1 style={{ margin: "1rem 0 .5rem" }}>Compte refusé</h1>
                        <p style={{ color: "#6b7280" }}>
                            Votre demande a été refusée. Contactez l'équipe PotCommun
                            pour plus d'informations.
                        </p>
                    </div>
                </main>
            </>
        );
    }

    // ── Formulaire (association VALIDATED) ────────────────────────────

    return (
        <>
            <Header />
            <main className="cagnotte-form-page">
                <div className="cagnotte-form-card">
                    <h1>Créer une cagnotte</h1>
                    <p style={{ color: "#6b7280", fontSize: ".88rem", marginBottom: "1rem" }}>
                        Connecté en tant que <strong>{session.nom}</strong>
                    </p>

                    {erreurApi && <p className="form-erreur-api">{erreurApi}</p>}

                    <form onSubmit={soumettre} noValidate>

                        <div className="form-group">
                            <label htmlFor="titre">Titre *</label>
                            <input id="titre" name="titre" type="text"
                                placeholder="Ex : Repas de Noël pour les sans-abri"
                                value={form.titre} onChange={changer}
                                className={erreurs.titre ? "input-error" : ""}
                            />
                            {erreurs.titre && <span className="erreur-msg">{erreurs.titre}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea id="description" name="description" rows={4}
                                placeholder="Décrivez l'objectif de votre cagnotte…"
                                value={form.description} onChange={changer}
                            />
                        </div>

                        {/* Association pré-sélectionnée depuis la session */}
                        <div className="form-group">
                            <label htmlFor="associationId">Association bénéficiaire</label>
                            <input
                                type="text"
                                value={session.nom}
                                disabled
                                style={{ background: "#f3f4f6", cursor: "not-allowed" }}
                                className="auth-field__input"
                            />
                            <input type="hidden" name="associationId" value={form.associationId} />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="objectif">Objectif (€)</label>
                                <input id="objectif" name="objectif" type="number"
                                    min="1" step="0.01" placeholder="Ex : 5000"
                                    value={form.objectif} onChange={changer}
                                    className={erreurs.objectif ? "input-error" : ""}
                                />
                                {erreurs.objectif && <span className="erreur-msg">{erreurs.objectif}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dateFin">Date de fin</label>
                                <input id="dateFin" name="dateFin" type="date"
                                    value={form.dateFin} onChange={changer}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? "Création…" : "Créer la cagnotte"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
