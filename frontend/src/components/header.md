# Composant `Header`

> `frontend/src/components/Header.jsx` · `Header.css`

---

## Rôle

Barre de navigation globale de l'application, présente sur **toutes les pages**.  
Elle est montée une seule fois dans `App.jsx`, juste avant le `<Routes>`.

```jsx
// App.jsx
<BrowserRouter>
    <Header />   {/* ← ici, une seule fois */}
    <Routes>
        ...
    </Routes>
</BrowserRouter>
```

> ⚠️ Ne pas importer `<Header />` dans les pages individuelles (Login, Register, etc.) — il est déjà global.

---

## Structure visuelle

```
┌─────────────────────────────────────────────────────────────────┐
│  [logo]  AssocDons  │  Boutique  Solutions  …  │  Connexion  Register  │
└─────────────────────────────────────────────────────────────────┘
   header__logo          header__nav               header__auth
```

| Zone | Classe CSS | Description |
|---|---|---|
| Logo | `.header__logo` | Image + nom, lien vers `/` |
| Navigation | `.header__nav` | Liens de pages, actif mis en évidence |
| Auth | `.header__auth` | Boutons Connexion et Register |

---

## Logo

L'image du logo doit être placée ici :

```
frontend/src/assets/logo.png
```

Elle est importée statiquement dans le composant :

```jsx
import logo from "../assets/logo.png";
```

Pour changer le nom affiché à côté du logo, modifier la valeur dans le JSX :

```jsx
<span className="header__logo-name">AssocDons</span>
```

---

## Liens de navigation

Les liens sont déclarés dans le tableau `NAV_LINKS` en haut du fichier :

```jsx
const NAV_LINKS = [
    { label: "Boutique",   path: "/boutique" },
    { label: "Solutions",  path: "/solutions" },
    { label: "Évènements", path: "/evenements" },
    { label: "Projets",    path: "/projets" },
    { label: "Contact",    path: "/contact" },
    { label: "Bénévolat",  path: "/benevolat" },
];
```

**Pour ajouter un lien**, ajouter une entrée dans ce tableau et déclarer la route correspondante dans `App.jsx`.

**Pour supprimer un lien**, retirer l'entrée du tableau — aucune autre modification n'est nécessaire.

Le composant `NavLink` de React Router détecte automatiquement la page active et applique la classe `.header__nav-link--active` (fond bleu clair, texte bleu).

---

## Boutons d'authentification

| Bouton | Style | Route |
|---|---|---|
| Connexion | Ghost (bordure grise) | `/login` |
| Register | Plein bleu | `/register` |

Ces boutons sont de simples `<Link>` stylisés — ils ne gèrent pas d'état de session. La logique d'authentification est dans `Login.jsx` et `Register.jsx`.

---

## Style

Le Header est en `position: sticky` — il reste visible en haut de la page lors du défilement.

Les couleurs principales utilisées :

| Rôle | Valeur |
|---|---|
| Fond header | `#ffffff` |
| Texte nav | `#374151` |
| Lien actif | `#2563eb` |
| Fond lien actif | `#eff6ff` |
| Bouton Register | `#2563eb` |

Pour modifier une couleur globalement, éditer directement `Header.css`.

---

## Dépendances

- `react-router-dom` — `NavLink`, `Link` (routing)
- `../assets/logo.png` — image du logo (à fournir)

---

## Fichiers liés

```
frontend/
├── src/
│   ├── App.jsx                  ← monte le Header en global
│   ├── components/
│   │   ├── Header.jsx           ← composant
│   │   └── Header.css           ← styles
│   └── assets/
│       └── logo.png             ← logo (à placer ici)
```