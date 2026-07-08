import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import "../css/Auth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    ?? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export default function Register() {
    const [email,        setEmail]        = useState("");
    const [password,     setPassword]     = useState("");
    const [error,        setError]        = useState(null);
    const [success,      setSuccess]      = useState(false);
    const [loading,      setLoading]      = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const captchaRef = useRef(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!captchaToken) {
            setError("Veuillez compléter le captcha.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password, captchaToken }),
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.error ?? data.message ?? "Erreur lors de l'inscription.");
                captchaRef.current?.reset();
                setCaptchaToken(null);
            }
        } catch {
            setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
            captchaRef.current?.reset();
            setCaptchaToken(null);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="auth-page">
                <div className="auth-card">
                    <h2 className="auth-card__title">Vérifiez votre boîte mail</h2>
                    <p>
                        Un email de confirmation a été envoyé à <strong>{email}</strong>.
                        Cliquez sur le lien reçu pour activer votre compte.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h2 className="auth-card__title">Créer un compte</h2>

                {error && <p className="auth-error" role="alert">{error}</p>}

                <form className="auth-form" onSubmit={submit} noValidate>
                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="email">
                            Adresse mail
                        </label>
                        <input
                            id="email"
                            className="auth-field__input"
                            type="email"
                            placeholder="exemple@mail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-field__label" htmlFor="password">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            className="auth-field__input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={(token) => setCaptchaToken(token)}
                        onExpired={() => setCaptchaToken(null)}
                        ref={captchaRef}
                    />

                    <button
                        className="auth-btn"
                        type="submit"
                        disabled={loading || !captchaToken}
                    >
                        {loading ? "Création…" : "S'enregistrer"}
                    </button>
                </form>

                {/* Séparateur + lien espace association */}
                <div className="auth-switch">
                    <span>Vous représentez une association ?</span>
                    <Link to="/associations/register" className="auth-switch__link">
                        Inscrire mon association →
                    </Link>
                </div>
            </div>
        </main>
    );
}
