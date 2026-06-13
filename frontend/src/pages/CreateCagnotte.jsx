import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../css/Cagnotte.css";

export default function CreateCagnotte() {
    const navigate = useNavigate();

    const [associations, setAssociations] = useState([]);
    const [form, setForm] = useState({
        titre: "", description: "", objectif: "", associationId: "", dateFin: ""
    });
    const [erreurs, setErreurs] = useState({});
    const [loading, setLoading] = useState(false);
    const [erreurApi, setErreurApi] = useState(null);

    useEffect(() => {
        fetch("http://localhost:8080/api/associations")
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
            const res = await fetch("http://localhost:8080/api/cagnottes", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            });
            if (!res.ok) {
                const data = await res.json();
                setErreurApi(data.errors ? Object.values(data.errors).join(" — ") : "Erreur serveur.");
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

    return (
        <>
            <Header />
            <main className="cagnotte-form-page">
                <div className="cagnotte-form-card">
                    <h1>Créer une cagnotte</h1>

                    {erreurApi && <p className="form-erreur-api">{erreurApi}</p>}

                    <form onSubmit={soumettre} noValidate>

                        <div className="form-group">
                            <label htmlFor="titre">Titre *</label>
                            <input
                                id="titre" name="titre" type="text"
                                placeholder="Ex : Repas de Noël pour les sans-abri"
                                value={form.titre} onChange={changer}
                                className={erreurs.titre ? "input-error" : ""}
                            />
                            {erreurs.titre && <span className="erreur-msg">{erreurs.titre}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description" name="description" rows={4}
                                placeholder="Décrivez l'objectif de votre cagnotte…"
                                value={form.description} onChange={changer}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="associationId">Association bénéficiaire *</label>
                            <select
                                id="associationId" name="associationId"
                                value={form.associationId} onChange={changer}
                                className={erreurs.associationId ? "input-error" : ""}
                            >
                                <option value="">— Sélectionnez —</option>
                                {associations.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            {erreurs.associationId && <span className="erreur-msg">{erreurs.associationId}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="objectif">Objectif (€)</label>
                                <input
                                    id="objectif" name="objectif" type="number"
                                    min="1" step="0.01" placeholder="Ex : 5000"
                                    value={form.objectif} onChange={changer}
                                    className={erreurs.objectif ? "input-error" : ""}
                                />
                                {erreurs.objectif && <span className="erreur-msg">{erreurs.objectif}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dateFin">Date de fin</label>
                                <input
                                    id="dateFin" name="dateFin" type="date"
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