import { NavLink, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Header.css";

// 📌 Mettre le logo dans : frontend/src/assets/logo.png
// (renommer ton image en "logo.png")

const NAV_LINKS = [
    { label: "Boutique",    path: "/boutique" },
    { label: "Solutions",   path: "/solutions" },
    { label: "Évènements",  path: "/evenements" },
    { label: "Projets",     path: "/projets" },
    { label: "Contact",     path: "/contact" },
    { label: "Bénévolat",   path: "/benevolat" },
];

export default function Header() {
    return (
        <header className="header">
            {/* Logo — Link vers l'accueil (fix : span non cliquable remplacé) */}
            <Link to="/" className="header__logo">
                <img src={logo} alt="Logo MESI" className="header__logo-img" />
                <span className="header__logo-name">AssocDons</span>
            </Link>

            {/* Navigation centrale */}
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
            </nav>

            {/* Boutons d'authentification */}
            <div className="header__auth">
                <Link to="/login" className="header__auth-btn header__auth-btn--login">
                    Connexion
                </Link>
                <Link to="/register" className="header__auth-btn header__auth-btn--register">
                    Register
                </Link>
            </div>
        </header>
    );
}