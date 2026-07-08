import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Backoffice.css";
import { getSession, setUserSession, clearSession } from "../utils/session";
import EventCard from "../components/association/EventCard";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const ONGLETS = [
    { id: "espace",      label: "Espace" },
    { id: "evenements",  label: "Événements" },
    { id: "parametres",  label: "Paramètres" },
];

const ICONS = {
    espace: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
        </svg>
    ),
    evenements: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    parametres: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
    ),
};

// ── Données factices (démo, non branchées au backend) ──────────
const DONS_MOCK = [
    { id: 5, montant: 20,  association: "Les Restos du Cœur",   cagnotte: "Collecte de rentrée 2026", date: "2026-07-08" },
    { id: 1, montant: 25,  association: "Les Restos du Cœur",   cagnotte: "Panier de rentrée",        date: "2026-06-12" },
    { id: 2, montant: 50,  association: "Croix-Rouge française", cagnotte: "Aide aux sinistrés",       date: "2026-05-28" },
    { id: 3, montant: 10,  association: "WWF France",            cagnotte: "Protection des océans",    date: "2026-05-03" },
    { id: 4, montant: 100, association: "Emmaüs",                cagnotte: "Rénovation d'un foyer",     date: "2026-04-19" },
];

const NB_ASSOS_ADHERENTES = 3;

const EVENEMENTS_MOCK = [
    { id: 1, name: "Collecte de rentrée 2026", releaseDt: "2026-08-15", duration: 1, synopsis: "Collecte de fournitures scolaires pour les familles en difficulté.", associationName: "Les Restos du Cœur", associationCategorie: "Solidarité", lieu: "12 rue de Paris, 75010 Paris" },
    { id: 2, name: "Nettoyage des plages",      releaseDt: "2026-07-20", duration: 1, synopsis: "Journée de nettoyage participatif sur le littoral.", associationName: "WWF France", associationCategorie: "Environnement", lieu: "Plage du Prado, 13008 Marseille" },
    { id: 3, name: "Gala de solidarité",         releaseDt: "2026-09-05", duration: 1, synopsis: "Soirée caritative au profit des sinistrés.", associationName: "Croix-Rouge française", associationCategorie: "Santé", lieu: "Salle des fêtes, 69002 Lyon" },
];

// ── Garde d'accès ─────────────────────────────────────────────
function GardeAcces() {
    return (
        <div className="bo-guard">
            <div className="bo-guard__card">
                <h2>Accès réservé</h2>
                <p>Connectez-vous à votre espace particulier pour accéder à cette page.</p>
                <Link to="/login" className="bo-btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
                    Se connecter
                </Link>
                <p style={{ marginTop: "1rem", fontSize: ".85rem", color: "#9ca3af" }}>
                    Pas encore inscrit ?{" "}
                    <Link to="/register">Créer un compte</Link>
                </p>
            </div>
        </div>
    );
}

// ── Onglet Espace ──────────────────────────────────────────────
function TabEspace() {
    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Mon espace</h2>
            </div>

            <div className="bo-stats">
                <div className="bo-stat-card">
                    <div className="bo-stat-card__label">Associations adhérentes</div>
                    <div className="bo-stat-card__value">{NB_ASSOS_ADHERENTES}</div>
                    <div className="bo-stat-card__sub">dont vous êtes membre</div>
                </div>
            </div>

            <div className="bo-card" style={{ marginBottom: "1rem", padding: "1.25rem 1.5rem 0.5rem" }}>
                <div style={{ fontWeight: 600, marginBottom: ".75rem", color: "#15233d" }}>
                    Historique de mes dons
                </div>
            </div>

            <div className="bo-card-list">
                {DONS_MOCK.map(d => (
                    <div key={d.id} className="bo-item">
                        <div className="bo-item__body">
                            <p className="bo-item__title">{d.cagnotte}</p>
                            <div className="bo-item__meta">
                                <span>🏢 {d.association}</span>
                                <span>📅 {new Date(d.date).toLocaleDateString("fr-FR")}</span>
                            </div>
                        </div>
                        <div style={{ fontWeight: 700, color: "#15233d", fontSize: "1.05rem" }}>
                            {d.montant} €
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Onglet Événements ────────────────────────────────────────────
function TabEvenements() {
    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Mes événements</h2>
            </div>
            <p style={{ color: "#6b7280", fontSize: ".88rem", marginBottom: "1.5rem" }}>
                Événements pour lesquels vous avez réservé un billet.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
                {EVENEMENTS_MOCK.map(ev => (
                    <EventCard key={ev.id} event={ev} />
                ))}
            </div>
        </div>
    );
}

// ── Onglet Paramètres ────────────────────────────────────────────
function TabParametres({ session, onSessionUpdate }) {
    const [email, setEmail] = useState(session.email ?? "");
    const [password, setPassword] = useState("");
    const [erreur, setErreur] = useState(null);
    const [flash, setFlash] = useState(null);
    const [saving, setSaving] = useState(false);

    const soumettre = async (e) => {
        e.preventDefault();
        setErreur(null);
        setSaving(true);

        try {
            const res = await fetch(`${API_URL}/auth/profil/${session.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: password || undefined }),
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                setUserSession(data);
                onSessionUpdate(data);
                setPassword("");
                setFlash("Vos informations ont été mises à jour.");
            } else {
                setErreur(data.error ?? "Erreur lors de la mise à jour.");
            }
        } catch {
            setErreur("Impossible de joindre le serveur.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Paramètres du compte</h2>
            </div>

            {flash && (
                <div className="bo-flash bo-flash--ok" onClick={() => setFlash(null)}>
                    {flash} <span style={{ opacity: .6, fontSize: ".8em" }}>(cliquer pour fermer)</span>
                </div>
            )}
            {erreur && (
                <div className="bo-flash bo-flash--erreur" onClick={() => setErreur(null)}>
                    {erreur} <span style={{ opacity: .6, fontSize: ".8em" }}>(cliquer pour fermer)</span>
                </div>
            )}

            <div className="bo-card" style={{ maxWidth: 480 }}>
                <form onSubmit={soumettre} noValidate>
                    <div className="bo-form-group">
                        <label htmlFor="email">Adresse email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="bo-form-group">
                        <label htmlFor="password">Nouveau mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Laisser vide pour ne pas changer"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="bo-form-actions">
                        <button type="submit" className="bo-btn-primary" disabled={saving}>
                            {saving ? "Enregistrement…" : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────
export default function EspaceParticulier() {
    const navigate = useNavigate();
    const [session, setSession] = useState(() => getSession());
    const [onglet, setOnglet] = useState("espace");
    const [menuOuvert, setMenuOuvert] = useState(false);

    if (!session || session.type !== "user") {
        return <GardeAcces />;
    }

    const deconnecter = () => {
        clearSession();
        navigate("/");
    };

    return (
        <div className="bo-page">
            <header className="bo-header">
                <div className="bo-header__brand">
                    <button className="bo-header__menu-btn"
                            aria-label="Ouvrir le menu"
                            onClick={() => setMenuOuvert(o => !o)}>
                        ☰
                    </button>
                    <Link to="/" style={{ color: "#fff", textDecoration: "none", fontWeight: 800, fontSize: "1.1rem" }}>
                        PotCommun
                    </Link>
                    <span className="bo-header__badge">Particulier</span>
                    <span style={{ color: "#a0aec0", fontSize: ".9rem" }}>{session.nom}</span>
                </div>
                <div className="bo-header__right">
                    <button className="bo-header__logout" onClick={deconnecter}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <div className="bo-layout">
                {menuOuvert && (
                    <div className="bo-backdrop" onClick={() => setMenuOuvert(false)} />
                )}

                <aside className={`bo-sidebar${menuOuvert ? " bo-sidebar--open" : ""}`}>
                    <div className="bo-sidebar__section">Navigation</div>
                    {ONGLETS.map(o => (
                        <button key={o.id}
                                className={`bo-sidebar__item ${onglet === o.id ? "actif" : ""}`}
                                onClick={() => { setOnglet(o.id); setMenuOuvert(false); }}>
                            <span className="bo-sidebar__icon">{ICONS[o.id]}</span>
                            {o.label}
                        </button>
                    ))}
                </aside>

                <main className="bo-main">
                    {onglet === "espace"     && <TabEspace />}
                    {onglet === "evenements" && <TabEvenements />}
                    {onglet === "parametres" && <TabParametres session={session} onSessionUpdate={setSession} />}
                </main>
            </div>
        </div>
    );
}
