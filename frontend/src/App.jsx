import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"          element={<Home />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />

                {/* Pages à venir — toutes redirigées vers 404 pour l'instant */}
                <Route path="/associations" element={<NotFound />} />
                <Route path="/cagnottes"    element={<NotFound />} />
                <Route path="/evenements"   element={<NotFound />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}
