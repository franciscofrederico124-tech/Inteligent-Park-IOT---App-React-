import { useNavigate } from "react-router-dom";
import url from "../../hooks/url";

export default async function CheckSesssion(origin = "") {
    const navigate = useNavigate();

    if (origin == "sign") {
        const data = await fetch(url.apiBase + "/auth/check");
        const res = await data.json();
        if (!res.success || !res.user) {
            navigate("/sign");
        }
        else {
            navigate("/");
        }
    }
    else {
        const data = await fetch(url.apiBase + "/auth/check");
        const res = await data.json();
        if (!res.success || !res.user) {
            navigate("/sign");
        }

    }
}
