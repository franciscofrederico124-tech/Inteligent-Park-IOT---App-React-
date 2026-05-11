import url from "../../hooks/url";

export default async function getUser() {
    const data = localSotage.getItem('user');
    const res = JSON.parse(data);

    if (res && res.user != null) {
        return res.user;
    }
    else {
        return {
            "user": "visitante",
            "email": "**********@gmail.com"
        }
    }
}
