const NAV_LINKS = ["Associations", "Activités", "Projets", "Explorer", "Blog", "FAQ"];

export default function Header() {
    return (
        <nav style={{
            position: "sticky", top: 0, zIndex: 100, background: "#fff",
            borderBottom: "1px solid #eee", padding: "0 40px",
            display: "flex", alignItems: "center", justifyContent: "space-between", height: 64
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18, color: "#1a1a2e" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #1A5FA8, #0F9B72)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21C12 21 3 13.5 3 8a9 9 0 0 1 18 0c0 5.5-9 13-9 13z"/>
                        </svg>
                    </div>
                    PotCommun
                </div>

                <div style={{ display: "flex", gap: 24 }}>
                    {NAV_LINKS.map(l => (
                        <a key={l} href="#" style={{ fontSize: 14, fontWeight: 600, color: "#333", textDecoration: "none" }}>{l}</a>
                    ))}
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                </button>
                <button style={{ background: "none", border: "1px solid #ccc", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    Espace particulier
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <button style={{ background: "none", border: "1px solid #ccc", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    Espace association
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <button style={{ background: "#1A5FA8", color: "#fff", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    Connexion
                </button>
            </div>
        </nav>
    );
}