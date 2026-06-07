import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function App() {
    return (
        <BrowserRouter>
            {/* Header présent sur toutes les pages — plus besoin de l'importer page par page */}
            <Header />

            <Routes>
                <Route path="/"           element={<HomePage />} />
                <Route path="/login"      element={<Login />} />
                <Route path="/register"   element={<Register />} />

                {/* Pages à venir */}
                <Route path="/boutique"   element={<NotFound />} />
                <Route path="/solutions"  element={<NotFound />} />
                <Route path="/evenements" element={<NotFound />} />
                <Route path="/projets"    element={<NotFound />} />
                <Route path="/contact"    element={<NotFound />} />
                <Route path="/benevolat"  element={<NotFound />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}