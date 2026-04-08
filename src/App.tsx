import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import AssistenteIA from "./pages/agent"
import SettingsPage from  "./pages/config"
import Reservas from "./pages/reservas";

import style from "./style/App.module.css";
import "./style/icons-1.13.1/font/bootstrap-icons.css";
import "./style/icons-1.13.1/font/bootstrap-icons.min.css";


function App() {
  return (
    <div className={style.appContainer}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/assistente" element={<AssistenteIA /> }></Route>
          <Route path="/configuracoes" element={<SettingsPage /> }></Route>
          <Route path="/reservas" element={<Reservas /> }></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
