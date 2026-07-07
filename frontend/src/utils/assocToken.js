const SALT = "poc:mesi:2025";

export function encodeAssocId(id) {
    return btoa(`${SALT}:${id}`)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

export function decodeAssocId(token) {
    try {
        const padded = token.replace(/-/g, "+").replace(/_/g, "/");
        const str = atob(padded.padEnd(padded.length + (4 - (padded.length % 4)) % 4, "="));
        const prefix = SALT + ":";
        if (!str.startsWith(prefix)) return null;
        const id = parseInt(str.slice(prefix.length), 10);
        return isNaN(id) ? null : id;
    } catch {
        return null;
    }
}
