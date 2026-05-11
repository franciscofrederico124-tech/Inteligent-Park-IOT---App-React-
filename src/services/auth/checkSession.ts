mexport default function CheckSesssion(type?: string) {
    const user = localStorage.getItem('user');

    if (type === "sign") {

        if (user) {
            window.location.href = "/"; 
        }
    } else {
      if (!user) {
            window.location.href = "/login"; 
        }
    }
}
