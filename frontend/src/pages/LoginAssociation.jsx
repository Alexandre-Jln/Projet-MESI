import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/Auth.css";
import "../css/AssociationAuth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// ── Étapes du flow ─────────────────────────────────────────────
// "login"  → formulaire de connexion
// "iban"   → formulaire IBAN (compte validé mais pas de coordonnées)
// "pending"  → compte en attente
// "rejected" → compte rejeté
// "ok"     → tout bon, redirige vers créer cagnotte

export default function LoginAssociation() {
    const navigate = useNavigate();

    const [etape,    setEtape]    = useState("login");
    const [session,  setSession]  = useState(null);

    // Champs login
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [errLogin, setErrLogin] = useState(null);
    const [loadLogin, setLoadLogin] = useState(false);

    // Champs IBAN
    const [iban,      setIban]      = useState("");
    const [titulaire, setTitulaire] = useState("");
    const [errIban,   setErrIban]   = useState(null);
    const [loadIban,  setLoadIban]  = useState(false);
    const [ibanOk,    setIbanOk]    = useState(false);

    // ── Connexion ────────────────────────────────────────────────

    const connecter = async (e) => {
        e.preventDefault();
        setErrLogin(null);
        setLoadLogin(true);

        try {
            const res = await fetch(`${API_URL}/api/associations/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErrLogin(data.error ?? "Identifiants invalides.");
                return;
            }

            const sess = {
                id:             data.id,
                nom:            data.nom,
                email:          data.email,
                statut:         data.statut,
                ibanEnregistre: data.ibanEnregistre,
            };
            sessionStorage.setItem("assoc_session", JSON.stringify(sess));
            setSession(sess);
            setTitulaire(data.nom ?? "");

            if (data.statut === "PENDING")   { setEtape("pending");  return; }
            if (data.statut === "REJECTED")  { setEtape("rejected"); return; }
            if (!data.ibanEnregistre)        { setEtape("iban");     return; }
            navigate("/cagnottes/creer");

        } catch {
            setErrLogin("Impossible de contacter le serveur.");
        } finally {
            setLoadLogin(false);
        }
    };

    // ── Enregistrement IBAN ──────────────────────────────────────

    const formaterIban = (val) =>
        val.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/(.{4})/g, "$1 ").trim();

    const sauverIban = async (e) => {
        e.preventDefault();
        const ibanNettoye = iban.replace(/\s/g, "");

        if (ibanNettoye.length < 15) {
            setErrIban("L'IBAN semble trop court."); return;
        }
        if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(ibanNettoye)) {
            setErrIban("Format invalide. Exemple : FR76 3000 6000 0112 3456 7890 189"); return;
        }

        setLoadIban(true);
        setErrIban(null);

        try {
            const res = await fetch(
                `${API_URL}/api/associations/${session.id}/coordonnees-bancaires`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ iban: ibanNettoye, titulaire }),
                }
            );

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setErrIban(data.error ?? "Erreur lors de l'enregistrement.");
                return;
            }

            sessionStorage.setItem("assoc_session",
                JSON.stringify({ ...session, ibanEnregistre: true }));
            setIbanOk(true);

        } catch {
            setErrIban("Impossible de contacter le serveur.");
        } finally {
            setLoadIban(false);
        }
    };

    // ── Rendu ────────────────────────────────────────────────────

    // Succès IBAN
    if (ibanOk) {
        return (
            <main className="auth-page">
                <div className="auth-card assoc-card">
                    <div className="assoc-succes">
                        <span className="assoc-succes__icon">✓</span>
                        <h2>Coordonnées enregistrées !</h2>
                        <p>Vous pouvez maintenant créer vos premières cagnottes.</p>
                        <Link to="/cagnottes/creer" className="auth-btn assoc-btn-link">
                            Créer une cagnotte →
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Formulaire IBAN
    if (etape === "iban") {
        return (
            <main className="auth-page">
                <div className="auth-card assoc-card">
                    <h2 className="auth-card__title">Coordonnées bancaires</h2>
                    {session && (
                        <p className="assoc-subtitle">
                            <strong>{session.nom}</strong> — étape requise avant de créer une cagnotte.
                        </p>
                    )}

                    <div className="iban-info-banner">
                        <span className="iban-info-banner__icon">ℹ️</span>
                        <div>
                            <strong>Pourquoi ces informations ?</strong>
                            <p>
                                Dans la version finale, les dons seront reversés automatiquement
                                via <strong>Stripe Connect</strong>. Ces coordonnées permettent
                                de préparer votre intégration.
                            </p>
                        </div>
                    </div>

                    {errIban && <p className="auth-error" role="alert">{errIban}</p>}

                    <form className="auth-form" onSubmit={sauverIban} noValidate>
                        <div className="auth-field">
                            <label className="auth-field__label" htmlFor="titulaire">
                                Titulaire du compte
                            </label>
                            <input id="titulaire" type="text" className="auth-field__input"
                                   placeholder="Nom tel qu'il apparaît sur le RIB"
                                   value={titulaire}
                                   onChange={e => setTitulaire(e.target.value)}
                            />
                        </div>

                        <div className="auth-field">
                            <label className="auth-field__label" htmlFor="iban">IBAN *</label>
                            <input id="iban" type="text"
                                   className="auth-field__input iban-input"
                                   placeholder="FR76 3000 6000 0112 3456 7890 189"
                                   value={iban}
                                   onChange={e => { setIban(formaterIban(e.target.value)); setErrIban(null); }}
                                   maxLength={42} autoComplete="off" spellCheck={false}
                            />
                            <span className="auth-field__hint">
                                Trouvez votre IBAN sur votre RIB (relevé d'identité bancaire).
                            </span>
                        </div>

                        <button className="auth-btn" type="submit" disabled={loadIban || !iban}>
                            {loadIban ? "Enregistrement…" : "Enregistrer et continuer"}
                        </button>
                    </form>

                    <div className="auth-switch">
                        <span>Vous souhaitez le faire plus tard ?</span>
                        <Link to="/cagnottes" className="auth-switch__link">
                            Parcourir les cagnottes
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Compte en attente
    if (etape === "pending") {
        return (
            <main className="auth-page">
                <div className="auth-card">
                    <div className="assoc-statut-banner assoc-statut-banner--pending" style={{margin:"1rem 0"}}>
                        <span>⏳</span>
                        <div>
                            <strong>Compte en attente de validation</strong>
                            <p>Notre équipe vérifie votre dossier et vous contactera sous 24 à 48h.</p>
                        </div>
                    </div>
                    <button className="auth-btn" onClick={() => { setEtape("login"); setEmail(""); setPassword(""); }}>
                        ← Retour
                    </button>
                </div>
            </main>
        );
    }

    // Compte rejeté
    if (etape === "rejected") {
        return (
            <main className="auth-page">
                <div className="auth-card">
                    <div className="assoc-statut-banner assoc-statut-banner--rejected" style={{margin:"1rem 0"}}>
                        <span>❌</span>
                        <div>
                            <strong>Inscription refusée</strong>
                            <p>Contactez l'équipe PotCommun pour plus d'informations.</p>
                        </div>
                    </div>
                    <button className="auth-btn" onClick={() => { setEtape("login"); setEmail(""); setPassword(""); }}>
                        ← Retour
                    </button>
                </div>
            </main>
        );
    }

    // Formulaire de connexion (étape par défaut)
    return (
        <main className="auth-page">
            <div className="auth-card">
                <h2 className="auth-card__title">Espace association</h2>
                <p className="assoc-subtitle">Connectez-vous pour gérer vos cagnottes.</p>

                {errLogin && <p className="auth-error" role="alert">{errLogin}</p>}

                <form className="auth-form" onSubmit={connecter} noValidate>
                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="email">Email</label>
                        <input id="email" className="auth-field__input" type="email"
                               placeholder="contact@mon-association.fr"
                               value={email} onChange={e => setEmail(e.target.value)}
                               required autoComplete="email"
                        />
                    </div>
                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="password">Mot de passe</label>
                        <input id="password" className="auth-field__input" type="password"
                               placeholder="••••••••"
                               value={password} onChange={e => setPassword(e.target.value)}
                               required autoComplete="current-password"
                        />
                    </div>
                    <button className="auth-btn" type="submit" disabled={loadLogin}>
                        {loadLogin ? "Connexion…" : "Se connecter"}
                    </button>
                    <p className="assoc-login-link">
                        Pas encore inscrit ?{" "}
                        <Link to="/associations/register">Inscrire mon association</Link>
                    </p>
                </form>

                <div className="auth-switch">
                    <span>Vous êtes un particulier ?</span>
                    <Link to="/login" className="auth-switch__link">← Connexion utilisateur</Link>
                </div>
            </div>
        </main>
    );
}