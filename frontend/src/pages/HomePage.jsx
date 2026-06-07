import { useState } from "react";
import Layout from "../components/Layout";
import "../css/HomePage.css";

const ACTIVITY_CATEGORIES = [
    { label: "Ateliers",     img: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80" },
    { label: "Compétitions", img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80" },
    { label: "Concerts",     img: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80" },
    { label: "Conférences",  img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80" },
    { label: "Cours",        img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80" },
    { label: "Fêtes",        img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80" },
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
            {/* ── HERO ── */}
            <section className="hero">
                <div className="hero__inner">
                    <h1 className="hero__title">
                        L&apos;engagement<br />
                        <span>tout simplement</span>
                    </h1>
                    <p className="hero__subtitle">
                        Bienvenue sur la plateforme pour créer, participer, s&apos;engager ou soutenir une association.
                    </p>
                    <div className="hero__search-box">
                        <div style={{ marginBottom: 18 }}>
                            <div className="hero__search-label">Quoi ?</div>
                            <input className="hero__search-input" type="text" placeholder="Une association, une activité..."
                                   value={searchWhat} onChange={e => setSearchWhat(e.target.value)} />
                        </div>
                        <div className="hero__search-separator">
                            <div className="hero__search-label">Où ?</div>
                            <input className="hero__search-input" type="text" placeholder="Une ville, une adresse..."
                                   value={searchWhere} onChange={e => setSearchWhere(e.target.value)} />
                        </div>
                        <button className="hero__search-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            Rechercher
                        </button>
                    </div>
                </div>
            </section>

            {/* ── ACTIVITÉS ── */}
            <section className="activities">
                <div className="activities__inner">
                    <h2 className="activities__title">Les idées d&apos;activités</h2>
                    <div className="activities__grid">
                        {ACTIVITY_CATEGORIES.map(cat => (
                            <div key={cat.label} className="activity-card">
                                <div className="activity-card__img-wrapper">
                                    <img className="activity-card__img" src={cat.img} alt={cat.label} />
                                </div>
                                <div className="activity-card__label">{cat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ASSOCIATION ── */}
            <section className="cta">
                <h2 className="cta__title">Vous êtes une association ?</h2>
                <p className="cta__subtitle">
                    Découvrez nos outils gratuits pour gérer vos événements, recevoir des dons et simplifier votre gestion.
                </p>
                <div className="cta__actions">
                    {["Inscrire mon association", "En savoir plus"].map(label => (
                        <button key={label} className="cta__btn">{label}</button>
                    ))}
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="stats">
                <div className="stats__grid">
                    {STATS.map(s => (
                        <div key={s.label}>
                            <div className="stats__value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stats__label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>
        </Layout>
    );
}