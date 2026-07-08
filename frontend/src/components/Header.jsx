import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../assets/logopotcommun.png";
import { getSession, clearSession, getInitiale } from "../utils/session";
import "../css/Header.css";

const NAV_LINKS = [
    { label: "Associations", path: "/associations" },
    { label: "Boutique",     path: "/boutique" },
    { label: "Solutions",    path: "/solutions" },
    { label: "Évènements",   path: "/evenements" },
    { label: "Projets",      path: "/projets" },
    { label: "Contact",      path: "/contact" },
    { label: "Bénévolat",    path: "/benevolat" },
];

export default function Header() {
    const navigate = useNavigate();
    const menuRef   = useRef(null);

    const [session, setSession]   = useState(() => getSession());
    const [menuOpen, setMenuOpen] = useState(false);

    // Relit la session à chaque navigation (après un login par exemple),
    // puisque sessionStorage ne déclenche pas de re-render automatique.
    useEffect(() => {
        const verifier = () => setSession(getSession());
        verifier();

        // Recharge aussi si l'utilisateur change d'onglet et revient
        window.addEventListener("focus", verifier);
        // Recharge sur navigation interne (changement de route)
        window.addEventListener("popstate", verifier);

        return () => {
            window.removeEventListener("focus", verifier);
            window.removeEventListener("popstate", verifier);
        };
    }, []);

    // Ferme le menu déroulant si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const deconnecter = () => {
        clearSession();
        setSession(null);
        setMenuOpen(false);
        navigate("/");
    };

    return (
        <header className="header">
            <Link to="/" className="header__logo">
                <img src={logo} alt="Logo PotCommun" className="header__logo-img" />
                <span className="header__logo-name">PotCommun</span>
            </Link>

            <nav className="header__nav" aria-label="Navigation principale">
                {NAV_LINKS.map(({ label, path }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            isActive
                                ? "header__nav-link header__nav-link--active"
                                : "header__nav-link"
                        }
                    >
                        {label}
                    </NavLink>
                ))}

                {/* Le bouton "Espace association" ne s'affiche que si
                    personne n'est connecté en tant qu'association */}
                {session?.type !== "association" && (
                    <Link to="/associations/login" className="header__nav-link header__nav-link--asso">
                        Espace association
                    </Link>
                )}
            </nav>

            {/* ── Zone droite : Connexion/Inscription OU avatar ──────── */}
            {!session ? (
                <div className="header__auth">
                    <Link to="/login" className="header__auth-btn header__auth-btn--login">
                        Connexion
                    </Link>
                    <Link to="/register" className="header__auth-btn header__auth-btn--register">
                        S&apos;inscrire
                    </Link>
                </div>
            ) : (
                <div className="header__account" ref={menuRef}>
                    <button
                        className="header__avatar-btn"
                        onClick={() => setMenuOpen(o => !o)}
                        aria-expanded={menuOpen}
                        aria-haspopup="true"
                    >
                        <span className="header__avatar">{getInitiale(session)}</span>
                        <span className="header__account-name">{session.nom}</span>
                        <span className={`header__chevron ${menuOpen ? "header__chevron--open" : ""}`}>
                            ▾
                        </span>
                    </button>

                    {menuOpen && (
                        <div className="header__dropdown" role="menu">
                            <div className="header__dropdown-header">
                                <span className="header__dropdown-name">{session.nom}</span>
                                <span className="header__dropdown-email">{session.email}</span>
                                {session.type === "association" && (
                                    <span className={`header__dropdown-badge header__dropdown-badge--${session.statut?.toLowerCase()}`}>
                                        {session.statut === "VALIDATED" ? "Compte validé"
                                       : session.statut === "PENDING"   ? "En attente"
                                       : session.statut}
                                    </span>
                                )}
                            </div>

                            <div className="header__dropdown-divider" />

                            {session.type === "association" ? (
                                <>
                                    <Link to="/cagnottes/creer" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                                        Créer une cagnotte
                                    </Link>
                                    <Link to="/associations/login" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                                        Mes coordonnées bancaires
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/profil" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                                        Mes dons
                                    </Link>
                                    <Link to="/profil" className="header__dropdown-item" onClick={() => setMenuOpen(false)}>
                                        Mon profil
                                    </Link>
                                </>
                            )}

                            <div className="header__dropdown-divider" />

                            <button className="header__dropdown-item header__dropdown-item--danger" onClick={deconnecter}>
                                Se déconnecter
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
