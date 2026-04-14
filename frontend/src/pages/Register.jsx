import { useState } from "react";
import Header from "../components/Header";
import "./Auth.css";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const submit = async (e) => {
        e.preventDefault();

        const res = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            alert("Compte créé !");
        } else {
            alert("Erreur lors de l'inscription");
        }
    };

    return (
        <>
            <Header />

            <main className="auth-page">
                <div className="auth-card">
                    <h2 className="auth-card__title">Créer un compte</h2>

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
                            S'enregistrer
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}
