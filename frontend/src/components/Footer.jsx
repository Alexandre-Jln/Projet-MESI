const FOOTER_COLUMNS = [
    {
        title: "Besoin d'aide ?",
        links: ["En tant qu'association ?", "En tant qu'utilisateur ?", "Suivre mes dons", "Nos solutions", "Guide", "Statut du site", "Contact"],
    },
    {
        title: "Explorer",
        links: ["Nos associations", "Nos évènements", "Autour de vous", "Recrutement", "Blog"],
    },
    {
        title: "Mentions légales",
        links: ["CGU associations", "CGU utilisateurs", "Mentions légales", "Confidentialité", "Gestion des cookies", "Guide des associations"],
    },
];

export default function Footer() {
    return (
        <footer style={{ background: "#fff", borderTop: "1px solid #eee", padding: "52px 40px 24px" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
                {/* Brand */}
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1A5FA8, #0F9B72)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 21C12 21 3 13.5 3 8a9 9 0 0 1 18 0c0 5.5-9 13-9 13z"/>
                            </svg>
                        </div>
                        PotCommun
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {["X", "IG", "YT", "IN"].map(s => (
                            <div key={s} style={{ width: 40, height: 40, border: "1.5px solid #ccc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#555", cursor: "pointer" }}>
                                {s}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columns */}
                {FOOTER_COLUMNS.map(col => (
                    <div key={col.title}>
                        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16, color: "#1a1a2e" }}>{col.title}</div>
                        {col.links.map(l => (
                            <a key={l} href="#" style={{ color: "#555", fontSize: 14, display: "block", marginBottom: 10, textDecoration: "none" }}>{l}</a>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ borderTop: "1px solid #eee", paddingTop: 20, textAlign: "center", color: "#aaa", fontSize: 13 }}>
                © 2026 PotCommun. Tous droits réservés.
            </div>
        </footer>
    );
}