import { useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import {
  FaHouse,
  FaUser,
  FaDog,
  FaWarehouse,
  FaCalendarCheck,
  FaBars,
  FaXmark,
} from "react-icons/fa6";
import { DashboardPage } from "./pages/DashboardPage";
import { CadastroProprietariosPage } from "./pages/CadastroProprietariosPage";
import { CadastroPetsPage } from "./pages/CadastroPetsPage";
import { CadastroCanisPage } from "./pages/CadastroCanisPage";
import { CadastroReservasPage } from "./pages/CadastroReservasPage";
import "./App.css";

function App() {
  const [menuAberto, setMenuAberto] = useState(false);

  const fecharMenu = () => setMenuAberto(false);

  return (
    <BrowserRouter>
      <div className="app">
        <button
          type="button"
          className={`menu-toggle ${menuAberto ? "open" : ""}`}
          aria-label="Abrir menu"
          onClick={() => setMenuAberto((value) => !value)}
        >
          {menuAberto ? <FaXmark /> : <FaBars />}
        </button>

        <aside className={`sidebar ${menuAberto ? "open" : ""}`}>
          <div className="logo">
            <span className="logo-icon">🐾</span>
            <h2>PetzIn</h2>
          </div>

          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={fecharMenu}
            >
              <span><FaHouse /></span> Visão geral
            </NavLink>

            <NavLink
              to="/cadastro/proprietarios"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={fecharMenu}
            >
              <span><FaUser /></span> Proprietários
            </NavLink>

            <NavLink
              to="/cadastro/pets"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={fecharMenu}
            >
              <span><FaDog /></span> Pets
            </NavLink>

            <NavLink
              to="/cadastro/canis"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={fecharMenu}
            >
              <span><FaWarehouse /></span> Canis
            </NavLink>

            <NavLink
              to="/cadastro/reservas"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={fecharMenu}
            >
              <span><FaCalendarCheck /></span> Reservas
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <span>Hotel para pets</span>
            <strong>Gestão de hospedagens</strong>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cadastro/proprietarios" element={<CadastroProprietariosPage />} />
            <Route path="/cadastro/pets" element={<CadastroPetsPage />} />
            <Route path="/cadastro/canis" element={<CadastroCanisPage />} />
            <Route path="/cadastro/reservas" element={<CadastroReservasPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;