import { useState } from "react";
import Header from "../components/Header";
import "./Auth.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            alert("Connexion réussie !");
        } else {
            alert("Identifiants invalides");
        }
    };

    return (
        <>
            <Header />

            <main className="auth-page">
                <div className="auth-card">
                    <h2 className="auth-card__title">Connexion</h2>

                    <form className="auth-form" onSubmit={submit}>
                        <div className="auth-field">
                            <label className="auth-field__label" htmlFor="email">
                                Adresse mail
                            </label>
                            <input
                                id="email"
                                className="auth-field__input"
                                type="email"
                                placeholder="exemple@mail.com"
                                onChange={e => setEmail(e.target.value)}
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
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        <button className="auth-btn" type="submit">
                            Se connecter
                        </button>

                        <a href="#" className="auth-forgot">
                            Mot de passe oublié ?
                        </a>
                    </form>
                </div>
            </main>
        </>
    );
}
