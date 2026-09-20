import { PREMIOS, formatarPremioCurto } from '../dados/premios';

interface Props {
  indiceAtual: number;
  patamares: number[];
}

export function EscadaPremios({ indiceAtual, patamares }: Props) {
  return (
    <aside className="escada-lateral">
      <div className="escada" role="list" aria-label="Escada de prêmios">
        {PREMIOS.map((valor, i) => {
          const classes = ['degrau'];
          if (i === indiceAtual) classes.push('atual');
          else if (i < indiceAtual) classes.push('passado');
          if (i === PREMIOS.length - 1) classes.push('milhao');
          if (patamares.includes(i + 1)) classes.push('patamar');
          return (
            <div
              key={valor}
              className={classes.join(' ')}
              role="listitem"
              aria-current={i === indiceAtual ? 'step' : undefined}
            >
              <span className="numero">{i + 1}</span>
              <span>{formatarPremioCurto(valor)}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
