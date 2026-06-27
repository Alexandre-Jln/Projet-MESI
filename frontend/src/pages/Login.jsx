import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import "../css/Auth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function Login() {
    const [email,         setEmail]         = useState("");
    const [password,      setPassword]      = useState("");
    const [error,         setError]         = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [captchaToken,  setCaptchaToken]  = useState(null);
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
            const res = await fetch(`${API_URL}/auth/login`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password, captchaToken }),
            });

            if (res.ok) {
                // TODO : stocker le token / rediriger
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message ?? "Identifiants invalides.");
                captchaRef.current?.resetCaptcha();
                setCaptchaToken(null);
            }
        } catch {
            setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
            captchaRef.current?.resetCaptcha();
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

                    <HCaptcha
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        ref={captchaRef}
                    />

                    <button
                        className="auth-btn"
                        type="submit"
                        disabled={loading || !captchaToken}
                    >
                        {loading ? "Connexion…" : "Se connecter"}
                    </button>

                    <a href="#" className="auth-forgot">
                        Mot de passe oublié ?
                    </a>
                </form>
            </div>
        </main>
    );
}