import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AssociationsPage from "./pages/public/AssociationsPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"            element={<HomePage />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/register"    element={<Register />} />
                <Route path="/associations" element={<AssociationsPage />} />
                <Route path="/boutique"    element={<NotFound />} />
                <Route path="/solutions"   element={<NotFound />} />
                <Route path="/evenements"  element={<NotFound />} />
                <Route path="/projets"     element={<NotFound />} />
                <Route path="/contact"     element={<NotFound />} />
                <Route path="/benevolat"   element={<NotFound />} />
                <Route path="*"            element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}