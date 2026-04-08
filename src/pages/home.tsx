import { useEffect, useState } from 'react';
import style from '../style/home.module.css';
import CardVaga from '../components/cardVaga';
import LoadingDots from "../components/loading";

// Definição de tipos para melhor suporte ao TypeScript
interface UserData {
  name: string;
  email: string;
}

interface ParkingData {
  free: number;
  ocuped: number;
  total: number;
}

function Home() {
  const [user, setUser] = useState<UserData>({ name: "", email: "" });
  const [parkingData, setParkingData] = useState<ParkingData | null>(null);

  useEffect(() => {
    let isMounted = true;
    let socket: WebSocket | null = null;

    // 1. Busca dados do usuário (REST)
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/app/statussession");
        if (!response.ok) throw new Error("Falha na sessão");
        
        const res = await response.json();

        if (isMounted && res?.user) {
          setUser({
            name: res.user.name || "Usuário",
            email: res.user.email || ""
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do usuário:", err);
      }
    };

    fetchUser();

    // 2. Configuração do WebSocket
    try {
      socket = new WebSocket("ws://localhost:3000/user/parkingdata");

      socket.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data: ParkingData = JSON.parse(event.data);
          
          setParkingData((prev) => {
            // Só atualiza o estado se os valores mudarem (evita re-render)
            const isDifferent = 
              !prev || 
              prev.free !== data.free || 
              prev.ocuped !== data.ocuped || 
              prev.total !== data.total;
            
            return isDifferent ? data : prev;
          });
        } catch (err) {
          console.error("Erro ao processar dados do WebSocket:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("Erro na conexão WebSocket:", error);
      };

    } catch (err) {
      console.error("Não foi possível iniciar o WebSocket:", err);
    }

    // Cleanup: Executa ao desmontar o componente
    return () => {
      isMounted = false;
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  return (
    <div className={style.home}>
      <div className={style.header}>
        <h1> Olá, <span>{user.name || "Visitante"}</span> </h1>
        
        <ul>
          <li title="Como funciona" onClick={() => { window.location.href = "http://localhost:3000/app.html#how-it-works" }}>
            <i className="bi bi-question-circle"></i>
          </li>
          <li title="Configurações" onClick={() => { window.location.href = "/configuracoes" }}>
            <i className="bi bi-person-circle"></i>
          </li>
        </ul>
      </div>

      <div className={style.content}>
        <h1>Dados do estacionamento</h1>

        <div className={style.parkingData}>
          {parkingData ? (
            <div className={style.cards}>
              <CardVaga
                title="Vagas disponíveis"
                cont={parkingData.free}
                iconClass="car-front text-success"
              />
              <CardVaga
                title="Vagas ocupadas"
                cont={parkingData.ocuped}
                iconClass="car-front-fill text-danger"
              />
              <CardVaga
                title="Total de vagas"
                cont={parkingData.total}
                iconClass="grid-3x3-gap-fill text-primary"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <LoadingDots />
            </div>
          )}
        </div>
      </div>

      <div className={style.actualLocation}>
        {/* Espaço para conteúdo futuro */}
      </div>
    </div>
  );
}

export default Home;