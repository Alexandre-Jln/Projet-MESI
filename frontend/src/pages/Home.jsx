import { Link } from "react-router-dom";

export default function Home() {
    return (
        <main style={{ textAlign: "center", marginTop: "100px" }}>
            <h1>Bienvenue sur AssocDons</h1>
            <p style={{ marginTop: "1rem", color: "#6b7280" }}>
                La plateforme collaborative pour vos associations.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
                {/* Fix : <Link to="..."><button> est du HTML invalide — on stylise le Link directement */}
                <Link
                    to="/login"
                    style={{
                        padding: "0.6rem 1.4rem",
                        borderRadius: "8px",
                        border: "1.5px solid #d1d5db",
                        color: "#374151",
                        fontWeight: 600,
                        textDecoration: "none",
                    }}
                >
                    Connexion
                </Link>
                <Link
                    to="/register"
                    style={{
                        padding: "0.6rem 1.4rem",
                        borderRadius: "8px",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        fontWeight: 600,
                        textDecoration: "none",
                    }}
                >
                    S'inscrire
                </Link>
            </div>
        </main>
    );
}