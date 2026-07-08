// frontend/src/utils/session.js
//
// Gestion centralisée de la session courante (utilisateur OU association).
// Stockée dans sessionStorage sous une clé unique "potcommun_session" pour
// qu'il n'y ait jamais d'ambiguïté entre les deux types de compte connecté.

const SESSION_KEY = "potcommun_session";

/**
 * Enregistre une session utilisateur classique.
 * @param {{id: number, email: string}} user
 */
export function setUserSession(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        type:  "user",
        id:    user.id,
        email: user.email,
        // Nom affiché dans le header : on prend la partie avant @ de l'email
        // à défaut d'un champ "nom" dédié côté utilisateur classique.
        nom:   user.email.split("@")[0],
    }));
}

/**
 * Enregistre une session association.
 * @param {{id: number, nom: string, email: string, statut: string, ibanEnregistre: boolean}} assoc
 */
export function setAssociationSession(assoc) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        type:           "association",
        id:             assoc.id,
        nom:            assoc.nom,
        email:          assoc.email,
        statut:         assoc.statut,
        ibanEnregistre: assoc.ibanEnregistre,
    }));
}

/**
 * Récupère la session courante, ou null si personne n'est connecté.
 */
export function getSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

/** Déconnecte — efface la session, quel que soit son type. */
export function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

/** Initiale utilisée dans l'avatar rond du header. */
export function getInitiale(session) {
    if (!session?.nom) return "?";
    return session.nom.trim().charAt(0).toUpperCase();
}
