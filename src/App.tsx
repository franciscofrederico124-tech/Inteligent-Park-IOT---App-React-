import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import AssistenteIA from "./pages/agent"
import SettingsPage from "./pages/config"
import Localizacao from "./pages/localizacao";
import Sign from "./pages/Auth"
import style from "./style/App.module.css";
import "./style/icons-1.13.1/font/bootstrap-icons.css";
import "./style/icons-1.13.1/font/bootstrap-icons.min.css";


function App() {

  return (
    <div className={style.appContainer}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign" element={<Sign />}></Route>
          <Route path="/assistente" element={<AssistenteIA />}></Route>
          <Route path="/configuracoes" element={<SettingsPage />}></Route>
          <Route path="/reservas" element={<Localizacao />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
