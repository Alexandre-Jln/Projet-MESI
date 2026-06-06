import { useState } from "react";
import Layout from "../components/Layout";

const ACTIVITY_CATEGORIES = [
    { label: "Ateliers", img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80" },
    { label: "Compétitions", img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80" },
    { label: "Concerts", img: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80" },
    { label: "Conférences", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80" },
    { label: "Cours", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80" },
    { label: "Fêtes", img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80" },
];

const STATS = [
    { value: "15 000+", label: "Associations", color: "#1A5FA8" },
    { value: "2M+",     label: "Donateurs",    color: "#0F7A5A" },
    { value: "50M€",    label: "Collectés",    color: "#E8A020" },
    { value: "100k+",   label: "Événements",   color: "#1A5FA8" },
];

export default function HomePage() {
    const [searchWhat, setSearchWhat] = useState("");
    const [searchWhere, setSearchWhere] = useState("");

    return (
        <Layout>
            <style>{`
        .activity-card:hover .activity-img { transform: scale(1.05); }
        .activity-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
      `}</style>

            {/* ── HERO ── */}
            <section style={{ background: "linear-gradient(160deg, #EDF3FB 0%, #F5F0E8 100%)", padding: "80px 40px 100px" }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <h1 style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
                        L&apos;engagement<br />
                        <span style={{ color: "#1A5FA8", fontStyle: "italic" }}>tout simplement</span>
                    </h1>
                    <p style={{ fontSize: 17, color: "#555", maxWidth: 520, marginBottom: 40, lineHeight: 1.6 }}>
                        Bienvenue sur la plateforme pour créer, participer, s&apos;engager ou soutenir une association.
                    </p>

                    <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "28px 32px", maxWidth: 640 }}>
                        <div style={{ marginBottom: 18 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Quoi ?</div>
                            <input
                                type="text"
                                placeholder="Une association, une activité..."
                                value={searchWhat}
                                onChange={e => setSearchWhat(e.target.value)}
                                style={{ width: "100%", border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", color: "#333", background: "transparent", padding: "6px 0" }}
                            />
                        </div>
                        <div style={{ borderTop: "1px solid #eee", paddingTop: 18, marginBottom: 20 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Où ?</div>
                            <input
                                type="text"
                                placeholder="Une ville, une adresse..."
                                value={searchWhere}
                                onChange={e => setSearchWhere(e.target.value)}
                                style={{ width: "100%", border: "none", outline: "none", fontSize: 15, fontFamily: "inherit", color: "#333", background: "transparent", padding: "6px 0" }}
                            />
                        </div>
                        <button style={{ width: "100%", background: "#1A5FA8", color: "#fff", border: "none", borderRadius: 10, padding: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            Rechercher
                        </button>
                    </div>
                </div>
            </section>

            {/* ── ACTIVITÉS ── */}
            <section style={{ padding: "64px 40px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 36 }}>Les idées d&apos;activités</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                        {ACTIVITY_CATEGORIES.map(cat => (
                            <div key={cat.label} className="activity-card" style={{ borderRadius: 16, border: "1px solid #eee", overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.2s", background: "#fff" }}>
                                <div style={{ overflow: "hidden", height: 220 }}>
                                    <img className="activity-img" src={cat.img} alt={cat.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }} />
                                </div>
                                <div style={{ padding: "16px 20px", fontWeight: 700, fontSize: 16 }}>{cat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ASSOCIATION ── */}
            <section style={{ background: "linear-gradient(135deg, #1A5FA8 0%, #0F7A5A 100%)", padding: "64px 40px", textAlign: "center" }}>
                <h2 style={{ color: "#fff", fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Vous êtes une association ?</h2>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16, maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.6 }}>
                    Découvrez nos outils gratuits pour gérer vos événements, recevoir des dons et simplifier votre gestion.
                </p>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                    {["Inscrire mon association", "En savoir plus"].map(label => (
                        <button key={label} style={{ background: "transparent", color: "#fff", border: "1.5px solid #fff", borderRadius: 8, padding: "13px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            {label}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── STATS ── */}
            <section style={{ background: "#f7f8fa", padding: "56px 40px" }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }}>
                    {STATS.map(s => (
                        <div key={s.label}>
                            <div style={{ fontSize: 42, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 15, color: "#777", marginTop: 8 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>
        </Layout>
    );
}