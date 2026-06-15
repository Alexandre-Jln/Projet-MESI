import { NavLink, Link } from "react-router-dom";
import "../css/Header.css";

const NAV_LINKS = [
    { label: "Accueil",      path: "/" },
    { label: "Cagnottes",   path: "/cagnottes" },
    { label: "Évènements",  path: "/evenements" },
];

export default function Header() {
    return (
        <header className="header">
            <span className="header__logo">PotCommun</span>

            <nav className="header__nav">
                {NAV_LINKS.map(({ label, path }) => (
                    <NavLink
                        key={path}
                        to={path}
                        end={path === "/"}
                        className={({ isActive }) =>
                            isActive ? "header__nav-link header__nav-link--active" : "header__nav-link"
                        }
                    >
                        {label}
                    </NavLink>
                ))}

                {/* Lien espace association mis en avant dans la nav */}
                <Link to="/associations/login" className="header__nav-link header__nav-link--asso">
                    Espace association
                </Link>
            </nav>

            <div className="header__auth">
                <Link to="/login"    className="header__auth-btn header__auth-btn--login">
                    Connexion
                </Link>
                <Link to="/register" className="header__auth-btn header__auth-btn--register">
                    S'inscrire
                </Link>
            </div>
        </header>
    );
}
