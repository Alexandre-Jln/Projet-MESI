import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home           from "./pages/Home";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import NotFound       from "./pages/NotFound";
import Cagnottes      from "./pages/Cagnottes";
import CreateCagnotte from "./pages/CreateCagnotte";
import CagnotteDetail from "./pages/CagnotteDetail";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"                    element={<Home />} />
                <Route path="/login"               element={<Login />} />
                <Route path="/register"            element={<Register />} />

                {/* Cagnottes */}
                <Route path="/cagnottes"           element={<Cagnottes />} />
                <Route path="/cagnottes/creer"     element={<CreateCagnotte />} />
                <Route path="/cagnottes/:id"       element={<CagnotteDetail />} />

                <Route path="/associations"        element={<NotFound />} />
                <Route path="/evenements"          element={<NotFound />} />

                <Route path="*"                    element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
