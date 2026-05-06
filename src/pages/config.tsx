import '../style/config.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import url from "../hooks/url";
import CheckSesssion from '../services/auth/checkSession';

// Interface para melhor controle do usuário
interface UserData {
  name: string;
  email: string;
}

function SettingsLayout() {
  const navigate = useNavigate();
  CheckSesssion();

  const [user, setUser] = useState<UserData | null>(null);
  const [isAlert, setIsAlert] = useState({
    exib: false,
    text: "",
  });


  // 1. Busca a sessão ao carregar a página
  useEffect(() => {


    const fetchSession = async () => {
      try {
        const response = await fetch(url.apiBase + "/auth/check");
        const res = await response.json();

        if (response.ok && res?.user) {
          setUser(res.user);
        }
      } catch (err) {
        console.error("Erro ao buscar sessão:", err);
      }
    };

    fetchSession();
  }, []);

  // 2. Função para terminar sessão
  const FindSession = async () => {
    try {
      // Feedback imediato
      setIsAlert({
        exib: true,
        text: "Terminando..."
      });

      const response = await fetch(url.apiBase + "/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },

      });

      const res = await response.json();
      const isOk = response.ok;

      // Atualiza o alerta com o resultado do servidor
      setIsAlert({
        exib: true,
        text: isOk ? "Sessão terminada!" : (res.message || "Erro ao terminar sessão")
      });

      // Redireciona após 1.5s para dar tempo do usuário ler
      if (isOk) {
        setTimeout(() => {
          localStorage.removeItem("chat_history");
          navigate("/sign");
        }, 1500);
      } else {
        // Se der erro, esconde o alerta após 3s
        setTimeout(() => {
          setIsAlert({ exib: false, text: "" });
        }, 3000);
      }

    } catch (err) {
      console.error("Erro na requisição:", err);
      setIsAlert({
        exib: true,
        text: "Erro de conexão com o servidor!"
      });
      setTimeout(() => setIsAlert({ exib: false, text: "" }), 3000);
      navigate("/")
    }
  };

  return (
    <div className="main-wrapper">
      {/* Alerta Condicional */}
      <span className={`alert ${isAlert.exib ? "exibAlert" : ""}`}>
        {isAlert.text}
      </span>

      <header className="top-bar">
        <div className="header-content">
          <h1 className="header-text">
            Configurações <i className="bi bi-gear-fill header-icon"></i>
          </h1>
        </div>
      </header>

      <main className="content-area">
        <div className="container-fluid p-4">
          <div className="row g-4">

            {/* Card de Perfil */}
            <div className="col-md-6">
              <div className="perfilCard shadow-sm">
                <h6 className="section-label">Informações da Conta</h6>

                <div className="profile-header">
                  <div className="profile-avatar">
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div className="profile-info">
                    <h5 className="mb-0 fw-bold">
                      {user ? user.name : "Carregando..."}
                    </h5>
                    <p className="text-muted small">
                      {user ? user.email : "---"}
                    </p>

                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="profile-actions d-flex gap-2">
                  <button className="btn btn-orange flex-fill" onClick={FindSession}>
                    Terminar Sessão
                  </button>
                  <button className="btn btn-outline-secondary flex-fill">
                    Editar Perfil
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout;