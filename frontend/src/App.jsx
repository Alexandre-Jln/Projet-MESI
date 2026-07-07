import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage         from "./pages/HomePage";
import AssociationsPage from "./pages/public/AssociationsPage";
import EventsPage       from "./pages/public/EventsPage";
import Login               from "./pages/Login";
import Register            from "./pages/Register";
import NotFound            from "./pages/NotFound";
import Cagnottes           from "./pages/Cagnottes";
import CreateCagnotte      from "./pages/CreateCagnotte";
import CagnotteDetail      from "./pages/CagnotteDetail";
import RegisterAssociation from "./pages/RegisterAssociation";
import LoginAssociation    from "./pages/LoginAssociation";
import AdminAssociations      from "./pages/AdminAssociations";
import BackofficeAssociation from "./pages/BackofficeAssociation";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"             element={<HomePage />} />
                <Route path="/associations" element={<AssociationsPage />} />
                <Route path="/boutique"     element={<NotFound />} />
                <Route path="/solutions"    element={<NotFound />} />
                <Route path="/projets"      element={<NotFound />} />
                <Route path="/contact"      element={<NotFound />} />
                <Route path="/benevolat"    element={<NotFound />} />
                <Route path="/login"        element={<Login />} />
                <Route path="/register"     element={<Register />} />
                <Route path="/evenements"        element={<EventsPage />} />
                <Route path="/cagnottes"         element={<Cagnottes />} />
                <Route path="/cagnottes/creer"   element={<CreateCagnotte />} />
                <Route path="/cagnottes/:id"     element={<CagnotteDetail />} />
                <Route path="/associations/register" element={<RegisterAssociation />} />
                <Route path="/associations/login"    element={<LoginAssociation />} />
                <Route path="/admin/associations"         element={<AdminAssociations />} />
                <Route path="/associations/backoffice/:token" element={<BackofficeAssociation />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}