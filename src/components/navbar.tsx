import { NavLink } from "react-router-dom";
import style from "../style/Navbar.module.css";

function Navbar() {
  return (
    <aside className={style.sidebar}>
      <h2 className={style.logo}>
        SMART PARK IOT <i className="bi bi-car-front"></i>
      </h2>

      <nav className={style.navLinks}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${isActive ? style.active : ""} ${style.dashboard}`
          }
        >
          <i className="bi bi-house"></i>
        </NavLink>

        <NavLink
          to="/reservas"
          className={({ isActive }) =>
            `${isActive ? style.active : ""} ${style.reservas}`
          }
        >
          <i className="bi bi-calendar"></i>
        </NavLink>

        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `${isActive ? style.active : ""} ${style.configuracoes}`
          }
        >
          <i className="bi bi-gear"></i>
        </NavLink>

        <NavLink
          to="/assistente"
          className={({ isActive }) =>
            `${isActive ? style.active : ""} ${style.asssistente}`
          }
        >
          <i className="bi bi-robot"></i> 
        </NavLink>
      </nav>

      {/* O footer é escondido via CSS no mobile para não ocupar espaço no menu inferior */}
      <footer className={style.footer} onClick={() => window.location.href = "/configuracoes"}>
        <i className="bi bi-person-circle"></i>
        <span> Perfil </span>
      </footer>
    </aside>
  );
}

export default Navbar;