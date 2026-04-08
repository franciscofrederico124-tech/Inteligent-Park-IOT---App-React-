async function ParkingData() {
    try {
        const response = await fetch('http://localhost:3000/user/parkingdata');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao buscar dados do estacionamento:", error);
        return null;
    }
    
}

export default ParkingData;