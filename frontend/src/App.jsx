import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages develop
import HomePage         from "./pages/HomePage";
import AssociationsPage from "./pages/public/AssociationsPage";

// Pages ta branche
import Login               from "./pages/Login";
import Register            from "./pages/Register";
import NotFound            from "./pages/NotFound";
import Cagnottes           from "./pages/Cagnottes";
import CreateCagnotte      from "./pages/CreateCagnotte";
import CagnotteDetail      from "./pages/CagnotteDetail";
import RegisterAssociation from "./pages/RegisterAssociation";
import LoginAssociation    from "./pages/LoginAssociation";
import AdminAssociations   from "./pages/AdminAssociations";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── Pages develop ───────────────────────────────────── */}
                <Route path="/"             element={<HomePage />} />
                <Route path="/associations" element={<AssociationsPage />} />
                <Route path="/boutique"     element={<NotFound />} />
                <Route path="/solutions"    element={<NotFound />} />
                <Route path="/projets"      element={<NotFound />} />
                <Route path="/contact"      element={<NotFound />} />
                <Route path="/benevolat"    element={<NotFound />} />

                {/* ── Auth utilisateur ────────────────────────────────── */}
                <Route path="/login"        element={<Login />} />
                <Route path="/register"     element={<Register />} />

                {/* ── Cagnottes (ta branche) ──────────────────────────── */}
                <Route path="/evenements"        element={<NotFound />} />
                <Route path="/cagnottes"         element={<Cagnottes />} />
                <Route path="/cagnottes/creer"   element={<CreateCagnotte />} />
                <Route path="/cagnottes/:id"     element={<CagnotteDetail />} />

                {/* ── Espace association (ta branche) ─────────────────── */}
                <Route path="/associations/register" element={<RegisterAssociation />} />
                <Route path="/associations/login"    element={<LoginAssociation />} />

                {/* ── Administration (ta branche) ─────────────────────── */}
                <Route path="/admin/associations"    element={<AdminAssociations />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
