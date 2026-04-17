import { useState } from "react";
import "./Auth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function Register() {
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]    = useState(null);
    const [loading,  setLoading]  = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password }),
            });

            if (res.ok) {
                // TODO : rediriger vers /login ou connecter directement
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message ?? "Erreur lors de l'inscription.");
            }
        } catch {
            setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
        } finally {
            setLoading(false);
        }
    };

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

                    <button className="auth-btn" type="submit" disabled={loading}>
                        {loading ? "Création…" : "S'enregistrer"}
                    </button>
                </form>
            </div>
        </main>
    );
}