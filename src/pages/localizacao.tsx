import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useNavigate } from 'react-router-dom';
import '../style/reservas.css';
import LoadingDots from '../components/loading';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const destinoPos = new L.LatLng(-8.9027989, 13.3641443);

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

const RoutingMachine = ({ from, to, setInfo }: any) => {
    const map = useMap();
    useEffect(() => {
        if (!map || !from || !to) return;
        // @ts-ignore
        const routingControl = L.Routing.control({
            waypoints: [from, to],
            routeWhileDragging: false,
            addWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 5 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            }
        }).addTo(map);

        routingControl.on('routesfound', (e: any) => {
            const summary = e.routes[0].summary;
            const dist = (summary.totalDistance / 1000).toFixed(2) + " km";
            const time = Math.round(summary.totalTime / 60) + " min";
            setInfo(dist, time);
        });

        return () => { if (map && routingControl) map.removeControl(routingControl); };
    }, [map, from, to]);
    return null;
};

export default function Localizacao() {
    const navigate = useNavigate();
    const [userPos, setUserPos] = useState<L.LatLng | null>(null);
    const [info, setInfo] = useState({ dist: "---", time: "---" });
    const [distanciaValor, setDistanciaValor] = useState<number | null>(null);
    const [status, setStatus] = useState({ text: "Localizando...", reservable: false });
    const [timeLeft, setTimeLeft] = useState<number>(0);

    // Estado para os dados da sua API
    const [parkingStats, setParkingStats] = useState({ free: 0, ocuped: 0, total: 0 });

    // 1. GPS e Restauração do Timer ao Iniciar
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                setUserPos(new L.LatLng(lat, lon));
                setDistanciaValor(calcularDistancia(lat, lon, destinoPos.lat, destinoPos.lng));
            },
            () => { setUserPos(destinoPos); setDistanciaValor(0); }
        );

        const expiration = localStorage.getItem("reserva_fim");
        if (expiration) {
            const remaining = Math.floor((parseInt(expiration) - Date.now()) / 1000);
            if (remaining > 0) {
                setTimeLeft(remaining);
            } else {
                localStorage.removeItem("reserva_fim");
                localStorage.removeItem("reserva");
            }
        }
    }, []);

    // 2. Requisição à API a cada 5 segundos
    useEffect(() => {
        const fetchParkingData = async () => {
            try {
                // Altere para a URL real do seu servidor
                const response = await fetch('http://localhost:3000/user/parkingdata');
                const data = await response.json();
                if (data.total !== null) {
                    setParkingStats(data);
                }
            } catch (error) {
                console.error("Erro ao buscar dados do estacionamento:", error);
            }
        };

        fetchParkingData();
        const interval = setInterval(fetchParkingData, 4000);
        return () => clearInterval(interval);
    }, []);

    // 3. Gerenciar Status (Distância + Ocupação + UI)
    useEffect(() => {
        if (distanciaValor === null) return;

        if (timeLeft > 0) {
            setStatus({ text: "Vaga reservada!", reservable: false });
            return;
        }

        // Bloqueio por lotação
        if (parkingStats.total > 0 && parkingStats.free === 0) {
            setStatus({ text: " Estacionamento Lotado! ", reservable: false });
            return;
        }

        const PODE_RESERVAR = distanciaValor <= 110;
        setStatus({
            text: PODE_RESERVAR
                ? ` Pode reservar (${parkingStats.free} livres) `
                : " Não pode reservar, está muito longe! ",
            reservable: PODE_RESERVAR
        });
    }, [distanciaValor, timeLeft, parkingStats]);

    // 4. Ação de Reservar
    async function Reservar() {
        if (parkingStats.free === 0) return;

        const duration = 120; // 2 minutos
        const expirationTime = Date.now() + duration * 1000;

        localStorage.setItem("reserva_fim", expirationTime.toString());
        localStorage.setItem("reserva", JSON.stringify({ text: "Vaga reservada!", reservable: false }));

        setTimeLeft(duration);
    }

    // 5. Cronômetro Regressivo
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    localStorage.removeItem("reserva_fim");
                    localStorage.removeItem("reserva");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="reservas-wrapper">
            <header className="top-bar">
                <div className="header-content">
                    <h1 className="header-text">
                        Intituto Médio Privado de Tecnologias <i className="bi bi-pin header-icon"></i>
                    </h1>
                </div>
            </header>
            <main>
                <div className="reservas-map">
                    {userPos ? (
                        <MapContainer center={userPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                            <Marker position={userPos}><Popup>Você</Popup></Marker>
                            <Marker position={destinoPos}><Popup>Smart Park</Popup></Marker>
                            <RoutingMachine from={userPos} to={destinoPos} setInfo={(dist: string, time: string) => setInfo({ dist, time })} />
                        </MapContainer>
                    ) : (
                        <div className="reservas-map-loading"><LoadingDots /></div>
                    )}
                </div>
                <div className="reservas">
                    <span className='canbe'>
                        Esta a {distanciaValor !== null ? `${distanciaValor.toFixed(0)} m` : "---"} metros
                    </span>
                    <button
                        className={`btn-reservar`}
                        onClick={() => { navigate("/") }}
                    >
                        Ver dados
                    </button>
                </div>
            </main>
        </div>
    );
}