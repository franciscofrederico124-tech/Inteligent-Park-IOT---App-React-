import style from "../style/cardvaga.module.css";

interface CardVagaProps {
  title: string;
  cont: number | string;
  iconClass: string;
}

function CardVaga({ title, cont, iconClass }: CardVagaProps) {
  return (
    <div className={style.cardVaga}>
      <div className={style.header}>
        <h3>{title}</h3>
      </div>
      <div className={style.content}>
        <i className={`bi bi-${iconClass} ${style.icon}`}></i>
        <span className={style.value}>{cont}</span>
      </div>
    </div>
  );
}

export default CardVaga;
