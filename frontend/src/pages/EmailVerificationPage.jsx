import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "../css/Auth.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function EmailVerificationPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("loading"); // loading | success | error
    const [message, setMessage] = useState("");
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Lien de vérification invalide.");
            return;
        }

        fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`)
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (res.ok) {
                    setStatus("success");
                    setMessage(data.message ?? "Email vérifié avec succès.");
                } else {
                    setStatus("error");
                    setMessage(data.error ?? "Ce lien est invalide ou a expiré.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Impossible de joindre le serveur.");
            });
    }, [searchParams]);

    return (
        <main className="auth-page">
            <div className="auth-card">
                <h2 className="auth-card__title">Vérification de l'email</h2>

                {status === "loading" && <p>Vérification en cours…</p>}

                {status === "success" && (
                    <>
                        <p className="auth-success" role="status">{message}</p>
                        <Link to="/login" className="auth-btn">Se connecter</Link>
                    </>
                )}

                {status === "error" && (
                    <p className="auth-error" role="alert">{message}</p>
                )}
            </div>
        </main>
    );
}