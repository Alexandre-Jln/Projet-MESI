import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logopotcommun.png";
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
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
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

                <Link to="/associations/login" className="header__nav-link header__nav-link--asso">
                    Espace association
                </Link>
            </nav>

            <div className="header__auth">
                {user ? (
                    <>
                        <span className="header__auth-user">Bonjour {user.email}</span>
                        <button
                            className="header__auth-btn header__auth-btn--login"
                            onClick={handleLogout}
                        >
                            Déconnexion
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="header__auth-btn header__auth-btn--login">
                            Connexion
                        </Link>
                        <Link to="/register" className="header__auth-btn header__auth-btn--register">
                            S&apos;inscrire
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}