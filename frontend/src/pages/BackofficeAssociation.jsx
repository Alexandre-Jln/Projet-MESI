import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Backoffice.css";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const ONGLETS = [
    { id: "dashboard",  label: "Tableau de bord" },
    { id: "evenements", label: "Événements"       },
    { id: "cagnottes",  label: "Cagnottes"        },
    { id: "adherents",  label: "Adhérents"        },
    { id: "paiements",  label: "Paiements"        },
];

const ICONS = {
    dashboard: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1"/>
            <rect x="14" y="3" width="7" height="5" rx="1"/>
            <rect x="14" y="12" width="7" height="9" rx="1"/>
            <rect x="3" y="16" width="7" height="5" rx="1"/>
        </svg>
    ),
    adherents: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    paiements: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
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
    cagnottes: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
        </svg>
    ),
};

// ── Garde d'accès ─────────────────────────────────────────────
function GardeAcces({ session }) {
    if (!session) {
        return (
            <div className="bo-guard">
                <div className="bo-guard__card">
                    <h2>Accès réservé</h2>
                    <p>Connectez-vous à votre espace association pour accéder au backoffice.</p>
                    <Link to="/associations/login" className="bo-btn-primary"
                          style={{ display: "inline-block", textDecoration: "none" }}>
                        Se connecter
                    </Link>
                    <p style={{ marginTop: "1rem", fontSize: ".85rem", color: "#9ca3af" }}>
                        Pas encore inscrit ?{" "}
                        <Link to="/associations/register">Inscrire mon association</Link>
                    </p>
                </div>
            </div>
        );
    }

    if (session.statut === "PENDING") {
        return (
            <div className="bo-guard">
                <div className="bo-guard__card">
                    <span style={{ fontSize: "2.5rem" }}>⏳</span>
                    <h2>Compte en attente</h2>
                    <p>
                        Votre association <strong>{session.nom}</strong> est en cours de vérification.
                        Notre équipe valide votre compte sous 24 à 48h.
                    </p>
                </div>
            </div>
        );
    }

    if (session.statut === "REJECTED") {
        return (
            <div className="bo-guard">
                <div className="bo-guard__card">
                    <span style={{ fontSize: "2.5rem" }}>❌</span>
                    <h2>Compte refusé</h2>
                    <p>Votre demande a été refusée. Contactez l'équipe PotCommun pour plus d'informations.</p>
                    <Link to="/associations/login" className="bo-btn-secondary"
                          style={{ display: "inline-block", textDecoration: "none", marginTop: ".5rem" }}>
                        ← Retour connexion
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}

// ── Onglet Tableau de bord ────────────────────────────────────
function TabDashboard({ session, stats }) {
    const prochainEvenement = stats.evenements
        ?.filter(e => e.releaseDt >= new Date().toISOString().split("T")[0])
        .sort((a, b) => a.releaseDt?.localeCompare(b.releaseDt))[0];

    const nbAdherentsActifs = stats.adherents?.length ?? null;
    const nbEvenements      = stats.evenements?.filter(e => !e.brouillon).length ?? null;
    const nbCagnottes       = stats.cagnottes?.filter(c => c.actif).length ?? null;

    const alertesPaiements  = (stats.paiements ?? []).filter(p => p.status === 2);
    const alertesAdherents  = (stats.adherents ?? []).filter(a => a.role === "en_attente");

    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Bienvenue, {session.nom}</h2>
            </div>

            {(alertesPaiements.length > 0 || alertesAdherents.length > 0) && (
                <div style={{ marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: ".5rem" }}>
                    {alertesPaiements.length > 0 && (
                        <div className="bo-flash bo-flash--erreur" style={{ cursor: "default" }}>
                            ⚠️ {alertesPaiements.length} paiement{alertesPaiements.length > 1 ? "s" : ""} échoué{alertesPaiements.length > 1 ? "s" : ""}
                        </div>
                    )}
                    {alertesAdherents.length > 0 && (
                        <div className="bo-flash bo-flash--pending" style={{ cursor: "default" }}>
                            ℹ️ {alertesAdherents.length} adhésion{alertesAdherents.length > 1 ? "s" : ""} en attente de validation
                        </div>
                    )}
                </div>
            )}

            <div className="bo-stats">
                <div className="bo-stat-card">
                    <div className="bo-stat-card__label">Adhérents actifs</div>
                    <div className="bo-stat-card__value">
                        {nbAdherentsActifs !== null ? nbAdherentsActifs : "—"}
                    </div>
                    <div className="bo-stat-card__sub">membres enregistrés</div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-card__label">Événements</div>
                    <div className="bo-stat-card__value">
                        {nbEvenements !== null ? nbEvenements : "—"}
                    </div>
                    <div className="bo-stat-card__sub">créés par votre association</div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-card__label">Cagnottes actives</div>
                    <div className="bo-stat-card__value">
                        {nbCagnottes !== null ? nbCagnottes : "—"}
                    </div>
                    <div className="bo-stat-card__sub">en cours de collecte</div>
                </div>
                <div className="bo-stat-card">
                    <div className="bo-stat-card__label">Statut</div>
                    <div className="bo-stat-card__value" style={{ fontSize: "1.1rem", marginTop: ".4rem" }}>
                        <span className="bo-badge bo-badge--active">Validée</span>
                    </div>
                    <div className="bo-stat-card__sub">compte actif</div>
                </div>
            </div>

            {prochainEvenement && (
                <div className="bo-card" style={{ marginBottom: "1rem" }}>
                    <div style={{ fontWeight: 600, marginBottom: ".4rem", fontSize: ".85rem",
                                  textTransform: "uppercase", letterSpacing: ".06em", color: "#718096" }}>
                        Prochain événement
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "1rem" }}>{prochainEvenement.name}</div>
                    <div style={{ fontSize: ".85rem", color: "#6b7280", marginTop: ".25rem" }}>
                        📅 {new Date(prochainEvenement.releaseDt).toLocaleDateString("fr-FR")}
                        {prochainEvenement.duration && ` · ${prochainEvenement.duration} jour${prochainEvenement.duration > 1 ? "s" : ""}`}
                    </div>
                </div>
            )}

            <div className="bo-card">
                <div style={{ fontWeight: 600, marginBottom: ".5rem", color: "#15233d" }}>
                    Informations de votre association
                </div>
                <div style={{ fontSize: ".88rem", color: "#6b7280", display: "flex", flexDirection: "column", gap: ".3rem" }}>
                    {session.email     && <span>📧 {session.email}</span>}
                    {session.siret     && <span>🏢 SIRET : {session.siret}</span>}
                    {session.categorie && <span>🏷️ {session.categorie}</span>}
                </div>
            </div>
        </div>
    );
}

// ── Onglet Adhérents ──────────────────────────────────────────
function TabAdherents({ session }) {
    const [adherents, setAdherents] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [filtre,    setFiltre]    = useState("tous");

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/adhesions/read?associationId=${session.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setAdherents(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const exportCsv = () => {
        const lignes = [
            ["ID", "Prénom", "Nom", "Email", "Rôle", "Date adhésion"].join(";"),
            ...adherents.map(a => [
                a.userId, a.prenom ?? "", a.nom ?? "", a.email ?? "", a.role,
                a.date ? new Date(a.date).toLocaleDateString("fr-FR") : ""
            ].join(";"))
        ];
        const blob = new Blob([lignes.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href     = url;
        link.download = `adherents-${session.nom.replace(/\s+/g, "-")}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const filtres = [
        { id: "tous",   label: "Tous" },
        { id: "admin",  label: "Administrateurs" },
        { id: "membre", label: "Membres" },
    ];

    const affiches = filtre === "tous"
        ? adherents
        : adherents.filter(a => a.role === filtre);

    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Adhérents <span style={{ fontSize: ".8rem", fontWeight: 400, color: "#9ca3af" }}>({adherents.length})</span></h2>
                <button className="bo-btn-secondary" onClick={exportCsv} disabled={adherents.length === 0}>
                    ↓ Exporter CSV
                </button>
            </div>

            <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
                {filtres.map(f => (
                    <button key={f.id}
                            className="bo-btn-secondary"
                            style={filtre === f.id ? { borderColor: "#3b6fb6", color: "#3b6fb6", background: "#eff6ff" } : {}}
                            onClick={() => setFiltre(f.id)}>
                        {f.label}
                    </button>
                ))}
            </div>

            {loading && <p className="bo-loading">Chargement…</p>}

            {!loading && adherents.length === 0 && (
                <div className="bo-empty">
                    <span style={{ fontSize: "2rem" }}>👥</span>
                    <p>Aucun adhérent enregistré pour l'instant.</p>
                </div>
            )}

            <div className="bo-card-list">
                {affiches.map(a => (
                    <div key={a.id} className="bo-item">
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dbeafe",
                                      display: "flex", alignItems: "center", justifyContent: "center",
                                      fontWeight: 700, color: "#1d4ed8", fontSize: ".9rem", flexShrink: 0 }}>
                            {(a.prenom?.[0] ?? a.email?.[0] ?? "?").toUpperCase()}
                        </div>
                        <div className="bo-item__body">
                            <p className="bo-item__title">
                                {a.prenom || a.nom
                                    ? `${a.prenom ?? ""} ${a.nom ?? ""}`.trim()
                                    : a.email ?? `Utilisateur #${a.userId}`
                                }
                            </p>
                            <div className="bo-item__meta">
                                {a.email && <span>📧 {a.email}</span>}
                                {a.date  && <span>📅 Adhésion : {new Date(a.date).toLocaleDateString("fr-FR")}</span>}
                                <span className={`bo-badge ${a.role === "admin" ? "bo-badge--active" : "bo-badge--closed"}`}>
                                    {a.role}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Onglet Paiements ──────────────────────────────────────────
function TabPaiements({ session }) {
    const [paiements, setPaiements] = useState([]);
    const [loading,   setLoading]   = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/paiements/read?associationId=${session.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setPaiements(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const STATUT = {
        0: { label: "En attente",  cls: "bo-badge--pending" },
        1: { label: "Validé",      cls: "bo-badge--active"  },
        2: { label: "Refusé",      cls: "bo-badge--closed"  },
        3: { label: "Remboursé",   cls: "bo-badge--closed"  },
    };

    const totalValide = paiements
        .filter(p => p.status === 1)
        .reduce((s, p) => s + Number(p.montant ?? 0), 0);

    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Paiements reçus</h2>
            </div>

            {loading && <p className="bo-loading">Chargement…</p>}

            {!loading && paiements.length === 0 && (
                <div className="bo-empty">
                    <span style={{ fontSize: "2rem" }}>💳</span>
                    <p>Aucun paiement enregistré pour l'instant.</p>
                </div>
            )}

            {!loading && paiements.length > 0 && (
                <>
                    <div className="bo-stat-card" style={{ marginBottom: "1.5rem", maxWidth: 260 }}>
                        <div className="bo-stat-card__label">Total encaissé</div>
                        <div className="bo-stat-card__value">{totalValide.toLocaleString("fr-FR")} €</div>
                        <div className="bo-stat-card__sub">paiements validés</div>
                    </div>

                    <div className="bo-card" style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".9rem" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                                    <th style={{ padding: ".6rem 1rem", color: "#6b7280", fontWeight: 600 }}>Date</th>
                                    <th style={{ padding: ".6rem 1rem", color: "#6b7280", fontWeight: 600 }}>Événement</th>
                                    <th style={{ padding: ".6rem 1rem", color: "#6b7280", fontWeight: 600 }}>Mode</th>
                                    <th style={{ padding: ".6rem 1rem", color: "#6b7280", fontWeight: 600 }}>Montant</th>
                                    <th style={{ padding: ".6rem 1rem", color: "#6b7280", fontWeight: 600 }}>Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paiements.map(p => {
                                    const st = STATUT[p.status] ?? { label: String(p.status), cls: "" };
                                    return (
                                        <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: ".65rem 1rem" }}>
                                                {p.date ? new Date(p.date).toLocaleDateString("fr-FR") : "—"}
                                            </td>
                                            <td style={{ padding: ".65rem 1rem", color: "#4b5563" }}>
                                                {p.evenementNom ?? "—"}
                                            </td>
                                            <td style={{ padding: ".65rem 1rem" }}>{p.modePaiement ?? "—"}</td>
                                            <td style={{ padding: ".65rem 1rem", fontWeight: 600 }}>
                                                {p.montant !== undefined ? Number(p.montant).toLocaleString("fr-FR") + " €" : "—"}
                                            </td>
                                            <td style={{ padding: ".65rem 1rem" }}>
                                                <span className={`bo-badge ${st.cls}`}>{st.label}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Onglet Événements ─────────────────────────────────────────
function TabEvenements({ session }) {
    const [evenements,    setEvenements]    = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [flash,         setFlash]         = useState(null);
    const [showForm,      setShowForm]      = useState(false);
    const [form,          setForm]          = useState({ name: "", synopsis: "", releaseDt: "", duration: "" });
    const [erreurs,       setErreurs]       = useState({});
    const [saving,        setSaving]        = useState(false);
    const [photos,        setPhotos]        = useState([]);
    const [photoPreviews, setPhotoPreviews] = useState([]);

    const today = new Date().toISOString().split("T")[0];

    const charger = useCallback(() => {
        setLoading(true);
        fetch(`${API_URL}/evenements/read?associationId=${session.id}`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setEvenements(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [session.id]);

    useEffect(() => { charger(); }, [charger]);

    const changer = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErreurs(err => ({ ...err, [e.target.name]: null }));
    };

    const ajouterPhotos = (e) => {
        const nouveaux = Array.from(e.target.files);
        const total = [...photos, ...nouveaux].slice(0, 5);
        setPhotos(total);
        // Reset input pour permettre re-sélection du même fichier
        e.target.value = "";

        Promise.all(total.map(f => new Promise(res => {
            const reader = new FileReader();
            reader.onload = ev => res(ev.target.result);
            reader.readAsDataURL(f);
        }))).then(setPhotoPreviews);
    };

    const retirerPhoto = (index) => {
        const next = photos.filter((_, i) => i !== index);
        setPhotos(next);
        Promise.all(next.map(f => new Promise(res => {
            const reader = new FileReader();
            reader.onload = ev => res(ev.target.result);
            reader.readAsDataURL(f);
        }))).then(setPhotoPreviews);
    };

    const resetForm = () => {
        setShowForm(false);
        setForm({ name: "", synopsis: "", releaseDt: "", duration: "" });
        setErreurs({});
        setPhotos([]);
        setPhotoPreviews([]);
    };

    const creer = async (isBrouillon = false) => {
        const errs = {};
        if (!form.name.trim()) errs.name = "Le nom est obligatoire.";
        if (!isBrouillon && !form.releaseDt) errs.releaseDt = "La date est obligatoire pour publier.";
        if (Object.keys(errs).length) { setErreurs(errs); return; }

        setSaving(true);
        try {
            // 1. Créer l'événement
            const res = await fetch(`${API_URL}/evenements/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name:          form.name,
                    synopsis:      form.synopsis || null,
                    releaseDt:     form.releaseDt || null,
                    duration:      form.duration ? parseInt(form.duration) : null,
                    associationId: session.id,
                    brouillon:     isBrouillon,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setFlash({ type: "erreur", msg: data.error ?? "Erreur lors de la création." });
                return;
            }
            const evenement = await res.json();

            // 2. Uploader les photos si présentes
            if (photos.length > 0) {
                for (let i = 0; i < photos.length; i++) {
                    const fd = new FormData();
                    fd.append("file", photos[i]);
                    fd.append("ordre", String(i));
                    await fetch(`${API_URL}/evenements/${evenement.id}/photos/upload`, {
                        method: "POST",
                        body: fd,
                    });
                }
            }

            const msg = isBrouillon
                ? "Événement enregistré comme brouillon. Il ne sera pas visible publiquement."
                : photos.length > 0
                    ? `Événement publié avec ${photos.length} photo${photos.length > 1 ? "s" : ""} !`
                    : "Événement publié ! Il est maintenant visible sur la page publique.";
            setFlash({ type: "ok", msg });
            resetForm();
            charger();
        } catch {
            setFlash({ type: "erreur", msg: "Impossible de contacter le serveur." });
        } finally {
            setSaving(false);
        }
    };

    const supprimer = async (id) => {
        if (!window.confirm("Supprimer cet événement définitivement ?")) return;
        const res = await fetch(`${API_URL}/evenements/delete/${id}`, { method: "DELETE" });
        if (res.ok) {
            setFlash({ type: "ok", msg: "Événement supprimé." });
            charger();
        } else {
            setFlash({ type: "erreur", msg: "Impossible de supprimer cet événement." });
        }
    };

    const statut = (ev) => {
        if (ev.brouillon) return { label: "Brouillon", cls: "bo-badge--pending" };
        if (!ev.releaseDt) return { label: "Brouillon", cls: "bo-badge--pending" };
        const fin = new Date(ev.releaseDt);
        if (ev.duration) fin.setDate(fin.getDate() + (ev.duration - 1));
        if (fin.toISOString().split("T")[0] < today) return { label: "Passé",   cls: "bo-badge--closed" };
        return { label: "Publié", cls: "bo-badge--active" };
    };

    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Mes événements</h2>
                <button className="bo-btn-primary" onClick={() => setShowForm(true)}>
                    + Créer un événement
                </button>
            </div>

            {flash && (
                <div className={`bo-flash bo-flash--${flash.type}`} onClick={() => setFlash(null)}>
                    {flash.msg} <span style={{ opacity: .6, fontSize: ".8em" }}>(cliquer pour fermer)</span>
                </div>
            )}

            {loading && <p className="bo-loading">Chargement…</p>}

            {!loading && evenements.length === 0 && (
                <div className="bo-empty">
                    <span style={{ fontSize: "2rem" }}>📅</span>
                    <p>Aucun événement pour l'instant. Créez votre premier événement !</p>
                </div>
            )}

            <div className="bo-card-list">
                {evenements.map(ev => {
                    const st = statut(ev);
                    return (
                        <div key={ev.id} className="bo-item">
                            <div className="bo-item__body">
                                <p className="bo-item__title">
                                    {ev.name}
                                    <span className={`bo-badge ${st.cls}`} style={{ marginLeft: ".6rem", fontSize: ".72rem" }}>
                                        {st.label}
                                    </span>
                                </p>
                                <div className="bo-item__meta">
                                    {ev.releaseDt && (
                                        <span>📅 {new Date(ev.releaseDt).toLocaleDateString("fr-FR")}</span>
                                    )}
                                    {ev.duration && (
                                        <span>⏱ {ev.duration} jour{ev.duration > 1 ? "s" : ""}</span>
                                    )}
                                    <span>🎟️ {ev.nombreBillets ?? "—"} billet{ev.nombreBillets !== 1 ? "s" : ""} vendus</span>
                                    {ev.photoIds?.length > 0 && (
                                        <span>🖼️ {ev.photoIds.length} photo{ev.photoIds.length > 1 ? "s" : ""}</span>
                                    )}
                                </div>
                                {ev.synopsis && (
                                    <p style={{ fontSize: ".84rem", color: "#4b5563", marginTop: ".35rem" }}>
                                        {ev.synopsis.length > 120 ? ev.synopsis.slice(0, 120) + "…" : ev.synopsis}
                                    </p>
                                )}
                                {ev.photoIds?.length > 0 && (
                                    <div className="bo-item__photos">
                                        {ev.photoIds.map(pid => (
                                            <img key={pid}
                                                 src={`${API_URL}/evenements/photos/${pid}`}
                                                 alt=""
                                                 className="bo-item__photo" />
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="bo-item__actions">
                                <button className="bo-btn-danger" onClick={() => supprimer(ev.id)}>
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal création */}
            {showForm && (
                <div className="bo-modal-overlay"
                     onClick={e => e.target === e.currentTarget && resetForm()}>
                    <div className="bo-modal">
                        <h3>Créer un événement</h3>
                        <form onSubmit={e => e.preventDefault()} noValidate>
                            <div className="bo-form-group">
                                <label htmlFor="ev-name">Nom de l'événement *</label>
                                <input id="ev-name" name="name" type="text"
                                    placeholder="Ex : Collecte de rentrée 2026"
                                    value={form.name} onChange={changer} />
                                {erreurs.name && <span className="bo-erreur">{erreurs.name}</span>}
                            </div>

                            <div className="bo-form-group">
                                <label htmlFor="ev-synopsis">Description</label>
                                <textarea id="ev-synopsis" name="synopsis" rows={3}
                                    placeholder="Décrivez votre événement…"
                                    value={form.synopsis} onChange={changer} />
                            </div>

                            <div className="bo-form-row">
                                <div className="bo-form-group">
                                    <label htmlFor="ev-date">Date de début *</label>
                                    <input id="ev-date" name="releaseDt" type="date"
                                        min={today}
                                        value={form.releaseDt} onChange={changer} />
                                    {erreurs.releaseDt && <span className="bo-erreur">{erreurs.releaseDt}</span>}
                                </div>
                                <div className="bo-form-group">
                                    <label htmlFor="ev-duration">Durée (jours)</label>
                                    <input id="ev-duration" name="duration" type="number"
                                        min="1" placeholder="Ex : 3"
                                        value={form.duration} onChange={changer} />
                                </div>
                            </div>

                            {/* Upload photos */}
                            <div className="bo-form-group">
                                <label>Photos de l'événement (1 à 5)</label>
                                <div className="bo-photo-zone">
                                    {photoPreviews.map((src, i) => (
                                        <div key={i} className="bo-photo-thumb">
                                            <img src={src} alt={`Photo ${i + 1}`} />
                                            <button type="button" className="bo-photo-remove"
                                                    onClick={() => retirerPhoto(i)}>×</button>
                                        </div>
                                    ))}
                                    {photos.length < 5 && (
                                        <label className="bo-photo-add">
                                            <span style={{ fontSize: "1.6rem", lineHeight: 1 }}>+</span>
                                            <span>Photo</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                style={{ display: "none" }}
                                                onChange={ajouterPhotos}
                                            />
                                        </label>
                                    )}
                                </div>
                                <span className="bo-photo-hint">
                                    {photos.length === 0
                                        ? "Optionnel · formats JPG, PNG, WebP · max 10 Mo par photo"
                                        : `${photos.length}/5 photo${photos.length > 1 ? "s" : ""} sélectionnée${photos.length > 1 ? "s" : ""}`
                                    }
                                </span>
                            </div>

                            <div className="bo-form-actions">
                                <button type="button" className="bo-btn-secondary"
                                        onClick={resetForm} disabled={saving}>
                                    Annuler
                                </button>
                                <button type="button" className="bo-btn-secondary"
                                        onClick={() => creer(true)} disabled={saving}
                                        style={{ color: "#92400e", borderColor: "#fcd34d" }}>
                                    {saving ? "…" : "Brouillon"}
                                </button>
                                <button type="button" className="bo-btn-primary"
                                        onClick={() => creer(false)} disabled={saving}>
                                    {saving ? "Publication…" : "Publier"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Onglet Cagnottes ──────────────────────────────────────────
function TabCagnottes({ session }) {
    const [cagnottes, setCagnottes] = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [flash,     setFlash]     = useState(null);
    const [showForm,  setShowForm]  = useState(false);
    const [form,      setForm]      = useState({ titre: "", description: "", objectif: "", dateFin: "" });
    const [erreurs,   setErreurs]   = useState({});
    const [saving,    setSaving]    = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const charger = useCallback(() => {
        setLoading(true);
        fetch(`${API_URL}/api/cagnottes?associationId=${session.id}&includeInactif=true`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setCagnottes(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [session.id]);

    useEffect(() => { charger(); }, [charger]);

    const changer = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setErreurs(err => ({ ...err, [e.target.name]: null }));
    };

    const creerCagnotte = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.titre.trim()) errs.titre = "Le titre est obligatoire.";
        if (Object.keys(errs).length) { setErreurs(errs); return; }

        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/api/cagnottes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    titre:         form.titre,
                    description:   form.description || null,
                    objectif:      form.objectif ? parseFloat(form.objectif) : null,
                    associationId: session.id,
                    dateFin:       form.dateFin || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setFlash({ type: "erreur", msg: data.error ?? "Erreur lors de la création." });
                return;
            }
            setFlash({ type: "ok", msg: "Cagnotte créée ! Elle est visible sur la page publique." });
            setShowForm(false);
            setForm({ titre: "", description: "", objectif: "", dateFin: "" });
            charger();
        } catch {
            setFlash({ type: "erreur", msg: "Impossible de contacter le serveur." });
        } finally {
            setSaving(false);
        }
    };

    const toggleActif = async (id, actif) => {
        const action = actif ? "desactiver" : "activer";
        const label  = actif ? "Clôturer" : "Réactiver";
        if (!window.confirm(`${label} cette cagnotte ?`)) return;
        const res = await fetch(`${API_URL}/api/cagnottes/${id}/${action}`, { method: "PATCH" });
        if (res.ok) {
            setFlash({ type: "ok", msg: `Cagnotte ${actif ? "clôturée" : "réactivée"}.` });
            charger();
        } else {
            setFlash({ type: "erreur", msg: "Impossible de modifier cette cagnotte." });
        }
    };

    const pct = (c) => {
        if (!c.objectif || c.objectif <= 0) return null;
        return Math.min(100, Math.round((c.montantCollecte / c.objectif) * 100));
    };

    return (
        <div className="bo-content">
            <div className="bo-section-header">
                <h2>Mes cagnottes</h2>
                <button className="bo-btn-primary" onClick={() => setShowForm(true)}>
                    + Créer une cagnotte
                </button>
            </div>

            {flash && (
                <div className={`bo-flash bo-flash--${flash.type}`} onClick={() => setFlash(null)}>
                    {flash.msg} <span style={{ opacity: .6, fontSize: ".8em" }}>(cliquer pour fermer)</span>
                </div>
            )}

            {loading && <p className="bo-loading">Chargement…</p>}

            {!loading && cagnottes.length === 0 && (
                <div className="bo-empty">
                    <span style={{ fontSize: "2rem" }}>🎯</span>
                    <p>Aucune cagnotte pour l'instant. Créez votre première cagnotte !</p>
                </div>
            )}

            <div className="bo-card-list">
                {cagnottes.map(c => {
                    const progression = pct(c);
                    return (
                        <div key={c.id} className="bo-item">
                            <div className="bo-item__body">
                                <p className="bo-item__title">
                                    {c.titre}
                                    <span className={`bo-badge ${c.actif ? "bo-badge--active" : "bo-badge--closed"}`}
                                          style={{ marginLeft: ".6rem", fontSize: ".72rem" }}>
                                        {c.actif ? "Active" : "Clôturée"}
                                    </span>
                                </p>

                                <div className="bo-item__meta">
                                    <span>💶 {Number(c.montantCollecte).toLocaleString("fr-FR")} € collectés</span>
                                    {c.objectif && (
                                        <span>/ {Number(c.objectif).toLocaleString("fr-FR")} € objectif</span>
                                    )}
                                    {c.dateFin && (
                                        <span>📅 Fin : {new Date(c.dateFin).toLocaleDateString("fr-FR")}</span>
                                    )}
                                </div>

                                {progression !== null && (
                                    <div style={{ marginTop: ".5rem" }}>
                                        <div style={{ background: "#e5e7eb", borderRadius: "999px",
                                                      height: "6px", overflow: "hidden" }}>
                                            <div style={{ width: `${progression}%`, background: "#3b6fb6",
                                                          height: "100%", borderRadius: "999px",
                                                          transition: "width .4s" }} />
                                        </div>
                                        <span style={{ fontSize: ".75rem", color: "#6b7280",
                                                       marginTop: ".2rem", display: "block" }}>
                                            {progression}%
                                        </span>
                                    </div>
                                )}

                                {c.description && (
                                    <p style={{ fontSize: ".84rem", color: "#4b5563", marginTop: ".35rem" }}>
                                        {c.description.length > 120
                                            ? c.description.slice(0, 120) + "…"
                                            : c.description}
                                    </p>
                                )}
                            </div>

                            <div className="bo-item__actions">
                                <button
                                    className={c.actif ? "bo-btn-danger" : "bo-btn-secondary"}
                                    onClick={() => toggleActif(c.id, c.actif)}>
                                    {c.actif ? "Clôturer" : "Réactiver"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showForm && (
                <div className="bo-modal-overlay"
                     onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="bo-modal">
                        <h3>Créer une cagnotte</h3>
                        <form onSubmit={creerCagnotte} noValidate>
                            <div className="bo-form-group">
                                <label htmlFor="cg-titre">Titre *</label>
                                <input id="cg-titre" name="titre" type="text"
                                    placeholder="Ex : Collecte de Noël 2026"
                                    value={form.titre} onChange={changer} />
                                {erreurs.titre && <span className="bo-erreur">{erreurs.titre}</span>}
                            </div>

                            <div className="bo-form-group">
                                <label htmlFor="cg-desc">Description</label>
                                <textarea id="cg-desc" name="description" rows={3}
                                    placeholder="Décrivez votre cagnotte…"
                                    value={form.description} onChange={changer} />
                            </div>

                            <div className="bo-form-row">
                                <div className="bo-form-group">
                                    <label htmlFor="cg-objectif">Objectif (€)</label>
                                    <input id="cg-objectif" name="objectif" type="number"
                                        min="1" step="1" placeholder="Ex : 5000"
                                        value={form.objectif} onChange={changer} />
                                </div>
                                <div className="bo-form-group">
                                    <label htmlFor="cg-dateFin">Date de clôture</label>
                                    <input id="cg-dateFin" name="dateFin" type="date"
                                        min={today}
                                        value={form.dateFin} onChange={changer} />
                                </div>
                            </div>

                            <div className="bo-form-actions">
                                <button type="button" className="bo-btn-secondary"
                                        onClick={() => { setShowForm(false); setErreurs({}); }}>
                                    Annuler
                                </button>
                                <button type="submit" className="bo-btn-primary" disabled={saving}>
                                    {saving ? "Création…" : "Créer la cagnotte"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Page principale ───────────────────────────────────────────
export default function BackofficeAssociation() {
    const navigate = useNavigate();
    const [session,    setSession]    = useState(null);
    const [onglet,     setOnglet]     = useState("dashboard");
    const [stats,      setStats]      = useState({ evenements: null, adherents: null, paiements: null, cagnottes: null });
    const [menuOuvert, setMenuOuvert] = useState(false);

    useEffect(() => {
        const raw = sessionStorage.getItem("assoc_session");
        if (raw) setSession(JSON.parse(raw));
    }, []);

    useEffect(() => {
        if (!session || session.statut !== "VALIDATED") return;

        Promise.all([
            fetch(`${API_URL}/evenements/read?associationId=${session.id}`)
                .then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_URL}/adhesions/read?associationId=${session.id}`)
                .then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_URL}/paiements/read?associationId=${session.id}`)
                .then(r => r.ok ? r.json() : []).catch(() => []),
            fetch(`${API_URL}/api/cagnottes?associationId=${session.id}&includeInactif=true`)
                .then(r => r.ok ? r.json() : []).catch(() => []),
        ]).then(([evenements, adherents, paiements, cagnottes]) => {
            setStats({ evenements, adherents, paiements, cagnottes });
        });
    }, [session]);

    const deconnecter = () => {
        sessionStorage.removeItem("assoc_session");
        navigate("/associations/login");
    };

    if (!session || session.statut !== "VALIDATED") {
        return <GardeAcces session={session} />;
    }

    return (
        <div className="bo-page">
            {/* Header */}
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
                    <span className="bo-header__badge">Association</span>
                    <span style={{ color: "#a0aec0", fontSize: ".9rem" }}>{session.nom}</span>
                </div>
                <div className="bo-header__right">
                    <button className="bo-header__logout" onClick={deconnecter}>
                        Déconnexion
                    </button>
                </div>
            </header>

            {/* Layout sidebar + contenu */}
            <div className="bo-layout">
                {/* Backdrop mobile */}
                {menuOuvert && (
                    <div className="bo-backdrop" onClick={() => setMenuOuvert(false)} />
                )}

                {/* Sidebar */}
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

                {/* Contenu principal */}
                <main className="bo-main">
                    {onglet === "dashboard"  && <TabDashboard  session={session} stats={stats} />}
                    {onglet === "evenements" && <TabEvenements session={session} />}
                    {onglet === "cagnottes"  && <TabCagnottes  session={session} />}
                    {onglet === "adherents"  && <TabAdherents  session={session} />}
                    {onglet === "paiements"  && <TabPaiements  session={session} />}
                </main>
            </div>
        </div>
    );
}
