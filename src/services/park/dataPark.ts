import url from "../../hooks/url";

interface ParkingData {
    free: number;
    ocuped: number;
    total: number;
}

export default async function dataPark() {

    try {
        const data = await fetch(url.apiBase + "/park/data/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        
        const res: ParkingData = await data.json();
        console.log(res);

        if (res) {
            return res;
        }
        else {
            return {
                "free": 0,
                "ocupped": 0,
                "total": 0
            }
        }
    } catch (error: any) {
        return {
            "free": 0,
            "ocupped": 0,
            "total": 0
        }
    }
}