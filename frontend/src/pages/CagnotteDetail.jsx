import { useState, useEffect } from "react";
import { useParams }           from "react-router-dom";
import { loadStripe }          from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Header from "../components/Header";
import "../css/Cagnotte.css";

// Charge Stripe une seule fois (clé publique depuis les variables d'env Vite)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8082";

// ── Formulaire de paiement (rendu à l'intérieur du contexte Stripe <Elements>) ──
function FormulairePaiement({ cagnotteId, montant, onSucces }) {
    const stripe   = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [erreur,  setErreur]  = useState(null);

    const payer = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setErreur(null);

        const { error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required", // pas de redirection si pas nécessaire
        });

        if (error) {
            setErreur(error.message);
            setLoading(false);
            return;
        }

        // Paiement confirmé côté Stripe → on notifie le backend
        await fetch(
            `${API_URL}/api/cagnottes/${cagnotteId}/don/confirmer?montant=${montant}`,
            { method: "POST" }
        );
        onSucces();
    };

    return (
        <form onSubmit={payer} className="stripe-form">
            <PaymentElement />
            {erreur && <p className="erreur-msg">{erreur}</p>}
            <button type="submit" className="btn-submit" disabled={!stripe || loading}>
                {loading ? "Traitement…" : `Donner ${parseFloat(montant).toFixed(2)} €`}
            </button>
        </form>
    );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function CagnotteDetail() {
    const { id } = useParams();

    const [cagnotte,     setCagnotte]     = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [erreur,       setErreur]       = useState(null);

    const [montant,      setMontant]      = useState("10");
    const [clientSecret, setClientSecret] = useState(null);
    const [initLoading,  setInitLoading]  = useState(false);
    const [initErreur,   setInitErreur]   = useState(null);
    const [donReussi,    setDonReussi]    = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/cagnottes/${id}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => { setCagnotte(data); setLoading(false); })
            .catch(() => { setErreur("Cagnotte introuvable."); setLoading(false); });
    }, [id]);

    const initierDon = async () => {
        const m = parseFloat(montant);
        if (!m || m < 1) { setInitErreur("Le montant minimum est de 1 €."); return; }

        setInitLoading(true);
        setInitErreur(null);
        setClientSecret(null);

        try {
            const res = await fetch(`${API_URL}/api/cagnottes/${id}/don/initier`, {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ montant: m }),
            });
            const data = await res.json();
            setClientSecret(data.clientSecret);
        } catch {
            setInitErreur("Impossible d'initialiser le paiement. Réessaie.");
        } finally {
            setInitLoading(false);
        }
    };

    const progression = cagnotte?.objectif
        ? Math.min(100, Math.round((cagnotte.montantCollecte / cagnotte.objectif) * 100))
        : null;

    return (
        <>
            <Header />
            <main className="cagnotte-detail-page">

                {loading && <p className="cagnotte-message">Chargement…</p>}
                {erreur   && <p className="cagnotte-message erreur">{erreur}</p>}

                {cagnotte && (
                    <>
                        <div className="cagnotte-detail-header">
                            <h1>{cagnotte.titre}</h1>
                            <p className="cagnotte-desc">{cagnotte.description}</p>

                            {progression !== null && (
                                <div className="cagnotte-progress">
                                    <div className="progress-bar large">
                                        <div className="progress-fill" style={{ width: `${progression}%` }} />
                                    </div>
                                    <span className="progress-label">
                                        {cagnotte.montantCollecte.toFixed(2)} € collectés
                                        sur {cagnotte.objectif.toFixed(2)} € ({progression}%)
                                    </span>
                                </div>
                            )}
                            {!cagnotte.objectif && (
                                <p className="cagnotte-collecte large">{cagnotte.montantCollecte.toFixed(2)} € collectés</p>
                            )}
                            {cagnotte.dateFin && (
                                <p className="cagnotte-fin">
                                    Collecte ouverte jusqu'au {new Date(cagnotte.dateFin).toLocaleDateString("fr-FR")}
                                </p>
                            )}
                        </div>

                        <div className="cagnotte-don-section">
                            {donReussi ? (
                                <div className="don-succes">
                                    <span className="succes-icon">✓</span>
                                    <h2>Merci pour ton don !</h2>
                                    <p>Ta contribution a bien été prise en compte.</p>
                                </div>
                            ) : (
                                <>
                                    <h2>Faire un don</h2>

                                    {!clientSecret ? (
                                        <div className="montant-form">
                                            <label htmlFor="montant">Montant (€)</label>
                                            <div className="montant-rapides">
                                                {[5, 10, 20, 50].map(v => (
                                                    <button
                                                        key={v}
                                                        type="button"
                                                        className={`btn-montant ${montant === v ? "actif" : ""}`}
                                                        onClick={() => setMontant(String(v))}
                                                    >{v} €</button>
                                                ))}
                                            </div>
                                            <input
                                                id="montant" type="number" min="1" step="0.01"
                                                value={montant}
                                                onChange={e => setMontant(e.target.value)}
                                                placeholder="Autre montant"
                                            />
                                            {initErreur && <p className="erreur-msg">{initErreur}</p>}
                                            <button
                                                className="btn-submit"
                                                onClick={initierDon}
                                                disabled={initLoading}
                                            >
                                                {initLoading ? "Préparation…" : "Continuer vers le paiement"}
                                            </button>
                                        </div>
                                    ) : (
                                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                                            <FormulairePaiement
                                                cagnotteId={id}
                                                montant={montant}
                                                onSucces={() => setDonReussi(true)}
                                            />
                                        </Elements>
                                    )}
                                </>
                            )}
                        </div>
                    </>
                )}
            </main>
        </>
    );
}
