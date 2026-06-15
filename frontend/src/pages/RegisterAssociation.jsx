import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import "../css/Auth.css";
import "../css/AssociationAuth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function RegisterAssociation() {
    const erreurRef = useRef(null);

    const [form, setForm] = useState({
        siret: "", nom: "", email: "", password: "", confirmPassword: "",
        description: "", telephone: ""
    });
    const [erreurs,   setErreurs]   = useState({});
    const [loading,   setLoading]   = useState(false);
    const [erreurApi, setErreurApi] = useState(null);
    const [succes,    setSucces]    = useState(false);

    const changer = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErreurs(err => ({ ...err, [e.target.name]: null }));
    };

    const afficherErreur = (msg) => {
        setErreurApi(msg);
        // Scroll vers le message d'erreur après le prochain rendu
        setTimeout(() => erreurRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    };

    const valider = () => {
        const e = {};
        if (!form.siret.trim())    e.siret    = "Le SIRET est obligatoire.";
        else if (!/^\d{14}$/.test(form.siret.replace(/\s/g, "")))
                                   e.siret    = "Le SIRET doit contenir exactement 14 chiffres.";
        if (!form.email.trim())    e.email    = "L'email est obligatoire.";
        if (!form.password)        e.password = "Le mot de passe est obligatoire.";
        else if (form.password.length < 8)
                                   e.password = "Au moins 8 caractères.";
        if (form.password !== form.confirmPassword)
                                   e.confirmPassword = "Les mots de passe ne correspondent pas.";
        return e;
    };

    const soumettre = async (e) => {
        e.preventDefault();
        const e2 = valider();
        if (Object.keys(e2).length) { setErreurs(e2); return; }

        setLoading(true);
        setErreurApi(null);

        try {
            const res = await fetch(`${API_URL}/api/associations/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    siret:       form.siret.replace(/\s/g, ""),
                    nom:         form.nom || null,
                    email:       form.email,
                    password:    form.password,
                    description: form.description || null,
                    telephone:   form.telephone   || null,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = data.error
                    ?? (data.errors ? Object.values(data.errors).join(" — ") : null)
                    ?? "Erreur lors de l'inscription.";
                afficherErreur(msg);
                return;
            }

            setSucces(true);

        } catch {
            afficherErreur("Impossible de contacter le serveur.");
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
                        <h2>Demande envoyée !</h2>
                        <p>
                            Votre demande d'inscription a bien été reçue. Notre équipe va vérifier
                            les informations de votre association et vous donnera accès à votre
                            espace sous 24 à 48h.
                        </p>
                        <p className="assoc-succes__sub">
                            Vous recevrez une confirmation à <strong>{form.email}</strong>.
                        </p>
                        <Link to="/associations/login" className="auth-btn assoc-btn-link">
                            Aller à la connexion
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="auth-page">
            <div className="auth-card assoc-card">
                <h2 className="auth-card__title">Inscrire mon association</h2>
                <p className="assoc-subtitle">
                    Votre SIRET sera vérifié automatiquement via le registre officiel.
                    Un administrateur validera ensuite votre compte.
                </p>

                {/* Erreur API — visible en haut et scroll auto */}
                {erreurApi && (
                    <p className="auth-error" ref={erreurRef} role="alert">
                        {erreurApi}
                    </p>
                )}

                <form className="auth-form assoc-form" onSubmit={soumettre} noValidate>

                    <div className="assoc-section-title">Identification légale</div>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="siret">SIRET *</label>
                        <input id="siret" name="siret" type="text"
                            className={`auth-field__input ${erreurs.siret ? "input-error" : ""}`}
                            placeholder="14 chiffres (ex : 30251719200030)"
                            value={form.siret} onChange={changer} maxLength={14}
                        />
                        {erreurs.siret && <span className="auth-field__error">{erreurs.siret}</span>}
                        <span className="auth-field__hint">
                            Retrouvez votre SIRET sur <a href="https://annuaire-entreprises.data.gouv.fr" target="_blank" rel="noreferrer">annuaire-entreprises.data.gouv.fr</a> ou votre récépissé de déclaration.
                        </span>
                    </div>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="nom">
                            Nom (si différent du registre)
                        </label>
                        <input id="nom" name="nom" type="text"
                            className="auth-field__input"
                            placeholder="Sera remplacé par le nom officiel après vérification SIRET"
                            value={form.nom} onChange={changer}
                        />
                    </div>

                    <div className="assoc-section-title">Compte</div>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="email">Email *</label>
                        <input id="email" name="email" type="email"
                            className={`auth-field__input ${erreurs.email ? "input-error" : ""}`}
                            placeholder="contact@mon-association.fr"
                            value={form.email} onChange={changer} autoComplete="email"
                        />
                        {erreurs.email && <span className="auth-field__error">{erreurs.email}</span>}
                    </div>

                    <div className="assoc-form-row">
                        <div className="auth-field">
                            <label className="auth-field__label" htmlFor="password">Mot de passe *</label>
                            <input id="password" name="password" type="password"
                                className={`auth-field__input ${erreurs.password ? "input-error" : ""}`}
                                placeholder="8 caractères minimum"
                                value={form.password} onChange={changer} autoComplete="new-password"
                            />
                            {erreurs.password && <span className="auth-field__error">{erreurs.password}</span>}
                        </div>
                        <div className="auth-field">
                            <label className="auth-field__label" htmlFor="confirmPassword">Confirmer *</label>
                            <input id="confirmPassword" name="confirmPassword" type="password"
                                className={`auth-field__input ${erreurs.confirmPassword ? "input-error" : ""}`}
                                placeholder="Répétez le mot de passe"
                                value={form.confirmPassword} onChange={changer} autoComplete="new-password"
                            />
                            {erreurs.confirmPassword && <span className="auth-field__error">{erreurs.confirmPassword}</span>}
                        </div>
                    </div>

                    <div className="assoc-section-title">Informations complémentaires</div>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="description">Description</label>
                        <textarea id="description" name="description" rows={3}
                            className="auth-field__input"
                            placeholder="Décrivez brièvement votre association et ses missions…"
                            value={form.description} onChange={changer}
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="telephone">Téléphone</label>
                        <input id="telephone" name="telephone" type="tel"
                            className="auth-field__input"
                            placeholder="0X XX XX XX XX"
                            value={form.telephone} onChange={changer}
                        />
                    </div>

                    {/* Erreur répétée juste avant le bouton pour éviter d'avoir à scroller */}
                    {erreurApi && (
                        <p className="auth-error" style={{ marginBottom: 0 }}>{erreurApi}</p>
                    )}

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Vérification SIRET…" : "Soumettre la demande"}
                    </button>

                    <p className="assoc-login-link">
                        Déjà un compte ? <Link to="/associations/login">Se connecter</Link>
                    </p>
                </form>

                <div className="auth-switch">
                    <span>Vous êtes un particulier ?</span>
                    <Link to="/register" className="auth-switch__link">
                        ← Créer un compte utilisateur
                    </Link>
                </div>
            </div>
        </main>
    );
}
