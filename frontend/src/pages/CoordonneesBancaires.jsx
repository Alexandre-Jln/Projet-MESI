import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Auth.css";
import "../css/AssociationAuth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function CoordonneesBancaires() {
    const navigate  = useNavigate();
    const [session, setSession] = useState(null);
    const [iban,    setIban]    = useState("");
    const [titulaire, setTitulaire] = useState("");
    const [erreur,  setErreur]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [succes,  setSucces]  = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem("assoc_session");
        if (!raw) { navigate("/associations/login"); return; }
        const sess = JSON.parse(raw);
        if (sess.statut !== "VALIDATED") { navigate("/associations/login"); return; }
        setSession(sess);
        setTitulaire(sess.nom ?? "");
    }, []);

    const formaterIban = (val) => {
        // Affichage avec espaces tous les 4 caractères pour la lisibilité
        const nettoye = val.toUpperCase().replace(/[^A-Z0-9]/g, "");
        return nettoye.replace(/(.{4})/g, "$1 ").trim();
    };

    const changerIban = (e) => {
        setIban(formaterIban(e.target.value));
        setErreur(null);
    };

    const soumettre = async (e) => {
        e.preventDefault();
        const ibanNettoye = iban.replace(/\s/g, "");

        if (ibanNettoye.length < 15) {
            setErreur("L'IBAN semble trop court. Vérifiez le numéro saisi.");
            return;
        }
        if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(ibanNettoye)) {
            setErreur("Format IBAN invalide. Exemple : FR76 3000 6000 0112 3456 7890 189");
            return;
        }

        setLoading(true);
        setErreur(null);

        try {
            const res = await fetch(
                `${API_URL}/api/associations/${session.id}/coordonnees-bancaires`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ iban: ibanNettoye, titulaire }),
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErreur(data.error ?? "Erreur lors de l'enregistrement.");
                return;
            }

            // Mise à jour de la session avec le flag IBAN
            sessionStorage.setItem("assoc_session", JSON.stringify({
                ...session,
                ibanEnregistre: true,
            }));

            setSucces(true);

        } catch {
            setErreur("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    if (succes) {
        return (
            <main className="auth-page">
                <div className="auth-card assoc-card">
                    <div className="assoc-succes">
                        <span className="assoc-succes__icon">✓</span>
                        <h2>Coordonnées enregistrées !</h2>
                        <p>
                            Votre IBAN a bien été enregistré. Vous pouvez maintenant
                            créer vos premières cagnottes.
                        </p>
                        <Link to="/cagnottes/creer" className="auth-btn assoc-btn-link">
                            Créer une cagnotte →
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="auth-page">
            <div className="auth-card assoc-card">
                <h2 className="auth-card__title">Coordonnées bancaires</h2>

                {session && (
                    <p className="assoc-subtitle">
                        <strong>{session.nom}</strong> — étape requise avant de créer une cagnotte.
                    </p>
                )}

                {/* Bandeau informatif Stripe Connect */}
                <div className="iban-info-banner">
                    <span className="iban-info-banner__icon">ℹ️</span>
                    <div>
                        <strong>Pourquoi ces informations ?</strong>
                        <p>
                            Dans la version finale de PotCommun, les dons seront reversés
                            automatiquement sur votre compte via <strong>Stripe Connect</strong>.
                            Ces coordonnées permettent de préparer votre intégration et seront
                            vérifiées lors de l'activation complète des virements.
                        </p>
                    </div>
                </div>

                {erreur && <p className="auth-error" role="alert">{erreur}</p>}

                <form className="auth-form" onSubmit={soumettre} noValidate>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="titulaire">
                            Titulaire du compte
                        </label>
                        <input id="titulaire" type="text"
                            className="auth-field__input"
                            placeholder="Nom tel qu'il apparaît sur le RIB"
                            value={titulaire}
                            onChange={e => setTitulaire(e.target.value)}
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="iban">
                            IBAN *
                        </label>
                        <input id="iban" type="text"
                            className="auth-field__input iban-input"
                            placeholder="FR76 3000 6000 0112 3456 7890 189"
                            value={iban}
                            onChange={changerIban}
                            maxLength={42}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <span className="auth-field__hint">
                            Vous trouverez votre IBAN sur votre RIB (relevé d'identité bancaire).
                        </span>
                    </div>

                    <button className="auth-btn" type="submit" disabled={loading || !iban}>
                        {loading ? "Enregistrement…" : "Enregistrer et continuer"}
                    </button>
                </form>

                <div className="auth-switch">
                    <span>Vous souhaitez le faire plus tard ?</span>
                    <Link to="/cagnottes" className="auth-switch__link">
                        Parcourir les cagnottes sans créer
                    </Link>
                </div>
            </div>
        </main>
    );
}
