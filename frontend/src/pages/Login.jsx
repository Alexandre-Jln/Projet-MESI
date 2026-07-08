import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { setUserSession } from "../utils/session";
import "../css/Auth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    ?? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

export default function Login() {
    const navigate = useNavigate();
    const captchaRef = useRef(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!captchaToken) {
            setError("Veuillez compléter le captcha.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, captchaToken }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                // data = { id, email } renvoyé par UserMapper côté backend
                setUserSession(data);
                navigate("/");
            } else {
                setError(data.error ?? data.message ?? "Identifiants invalides.");
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

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h2 className="auth-card__title">Connexion</h2>

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
                            autoComplete="current-password"
                        />
                    </div>

                    <ReCAPTCHA
                        sitekey={RECAPTCHA_SITE_KEY}
                        onChange={(token) => setCaptchaToken(token)}
                        onExpired={() => setCaptchaToken(null)}
                        ref={captchaRef}
                    />

                    <button className="auth-btn" type="submit" disabled={loading || !captchaToken}>
                        {loading ? "Connexion…" : "Se connecter"}
                    </button>

                    <a href="#" className="auth-forgot">
                        Mot de passe oublié ?
                    </a>
                </form>

                <div className="auth-switch">
                    <span>Vous n'avez pas de compte ?</span>
                    <Link to="/register" className="auth-switch__link">
                        Inscrivez-vous →
                    </Link>
                </div>

                <div className="auth-switch">
                    <span>Vous représentez une association ?</span>
                    <Link to="/associations/login" className="auth-switch__link">
                        Connexion espace association →
                    </Link>
                </div>
            </div>
        </main>
    );
}
