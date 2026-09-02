import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Launcher from "./pages/Launcher.jsx";
import Pantry from "./pages/Pantry.jsx";
import Streams from "./pages/Streams.jsx";

const TITLES = {
  "/": "KitchenHub",
  "/despensa": "Despensa",
  "/streams": "Streams",
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="app-shell">
      <header className="topbar">
        {!isHome && (
          <button className="voltar" onClick={() => navigate("/")}>
            ←
          </button>
        )}
        <h1>{TITLES[location.pathname] ?? "KitchenHub"}</h1>
        <div className="spacer" />
      </header>

      <Routes>
        <Route path="/" element={<Launcher />} />
        <Route path="/despensa" element={<Pantry />} />
        <Route path="/streams" element={<Streams />} />
      </Routes>
    </div>
  );
}
