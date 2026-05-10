import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../style/home.module.css';
import CardVaga from '../components/cardVaga';
import LoadingDots from "../components/loading";
import CheckSesssion from '../services/auth/checkSession';
import getUser from '../services/auth/getUserData';
import dataPark from "../services/park/dataPark";

// Definição de tipos para melhor suporte ao TypeScript
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
  CheckSesssion();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData>({ name: "", email: "" });
  const [parkingData, setParkData] = useState<ParkingData>({
    "free": 0,
    "ocupped": 0,
    "total": 0
  });

  async function SETUSER() {
    const user = await getUser();
    setUser(user);
  }

  async function SETPARKDATA() {
    const data = await dataPark();
    setParkData(data)
  }


  useEffect(() => {

    const intervalId = setInterval(() => {
      SETPARKDATA();
      SETUSER();
      console.log("Dados atualizados!");
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className={style.home}>
      <div className={style.header}>
        <h1> Olá, <span>{user.name || "Visitante"}</span> </h1>

        <ul>
          <li title="Como funciona" onClick={() => { window.location.href = "https://inteligent-park-iot-landing-page.vercel.app#como-funciona" }}>
            <i className="bi bi-question-circle"></i>
          </li>
          <li title="Configurações" onClick={() => { navigate("/configuracoes") }}>
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
      </div>
    </div>
  );
}

export default Home;