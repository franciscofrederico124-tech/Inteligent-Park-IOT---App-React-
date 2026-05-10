import { useState, useEffect } from "react";

function LoadingDots() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : ""));
    }, 500); // atualiza a cada 0.5s

    return () => clearInterval(interval); // limpa ao desmontar
  }, []);

  return <p>Carregando{dots}</p>;
}

export default LoadingDots;