import url from "../../hooks/url";

export default async function getUser() {
    const data = await fetch(url.apiBase + "/auth/check");
    const res = await data.json();

    if (res.success && res && res.user != null) {
        return res.user;
    }
    else {
        return {
            "user": "visitante",
            "email": "**********@gmail.com"
        }
    }
}
