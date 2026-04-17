import { Link } from "react-router-dom";
import Header from "../components/Header";
import "./NotFound.css";

export default function NotFound() {
    return (
        <>
            <main className="not-found">
                <h1 className="not-found__code">404</h1>
                <p className="not-found__message">Cette page n'existe pas encore.</p>
                <Link to="/" className="not-found__back">Retour à l'accueil</Link>
            </main>
        </>
    );
}
