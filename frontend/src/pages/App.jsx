import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home                 from "./pages/Home";
import Login                from "./pages/Login";
import Register             from "./pages/Register";
import NotFound             from "./pages/NotFound";
import Cagnottes            from "./pages/Cagnottes";
import CreateCagnotte       from "./pages/CreateCagnotte";
import CagnotteDetail       from "./pages/CagnotteDetail";
import RegisterAssociation  from "./pages/RegisterAssociation";
import LoginAssociation     from "./pages/LoginAssociation";
import AdminAssociations    from "./pages/AdminAssociations";
import CoordonneesBancaires from "./pages/CoordonneesBancaires";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"          element={<Home />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />

                <Route path="/cagnottes"        element={<Cagnottes />} />
                <Route path="/cagnottes/creer"  element={<CreateCagnotte />} />
                <Route path="/cagnottes/:id"    element={<CagnotteDetail />} />

                <Route path="/associations/register"              element={<RegisterAssociation />} />
                <Route path="/associations/login"                 element={<LoginAssociation />} />
                <Route path="/associations/coordonnees-bancaires" element={<CoordonneesBancaires />} />

                <Route path="/admin/associations" element={<AdminAssociations />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}