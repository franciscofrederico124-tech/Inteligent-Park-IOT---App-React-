import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../style/home.module.css';
import CardVaga from '../components/cardVaga';
import LoadingDots from "../components/loading";
import CheckSesssion from '../services/auth/checkSession';
import getUser from '../services/auth/getUserData';
import dataPark from "../services/park/dataPark";
  
// Tipagens para TypeScript
interface UserData {
  name: string;
  email: string;
}

interface ParkingData {
  free: number;
  ocupped: number;
  total: number;
}

function Home() {
  // Verifica a sessão logo ao carregar
  CheckSesssion();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData>({ name: "", email: "" });
  const [parkingData, setParkData] = useState<ParkingData | null>(null);

  // Função para buscar dados do utilizador
  async function fetchUser() {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao procurar dados do utilizador:", error);
    }
  }

  // Função para buscar dados do parque
  async function fetchParkData() {
    try {
      const data = await dataPark();
      setParkData(data);
    } catch (error) {
      console.error("Erro ao atualizar dados do parque:", error);
    }
  }

  useEffect(() => {
    // Carrega o utilizador apenas uma vez (evita redundância)
    fetchUser();

    // Primeira chamada imediata para os dados do parque
    fetchParkData();

    // Intervalo de atualização (Ajustado para 3 segundos para poupar recursos)
    const intervalId = setInterval(() => {
      fetchParkData();
      console.log("Dados das vagas atualizados!");
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={style.home}>
      <div className={style.header}>
        <h1> Olá, <span>{user.name || "Visitante"}</span> </h1>

        <ul>
          <li 
            title="Como funciona" 
            onClick={() => { navigate('https://inteligent-park-iot-landing-page.vercel.app')}
          >
            <i className="bi bi-question-circle"></i>
          </li>
          <li 
            title="Configurações" 
            onClick={() => { navigate("/configuracoes") }}
          >
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
                cont={parkingData.ocupped}
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
        {/* Espaço para futura implementação de localização ou mapa */}
      </div>
    </div>
  );
}

export default Home;
