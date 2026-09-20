interface Props {
  segundos: number;
  total: number;
}

const RAIO = 46;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

/**
 * Relógio da pergunta: anel que se esvazia com o tempo, com o número no centro.
 * Fica laranja nos últimos 10 segundos e vermelho pulsante nos últimos 5.
 */
export function Cronometro({ segundos, total }: Props) {
  if (total <= 0) return null;

  const fracao = Math.max(0, Math.min(1, segundos / total));
  const critico = segundos <= 5;
  const atencao = !critico && segundos <= 10;
  const classes = ['cronometro', critico ? 'critico' : atencao ? 'atencao' : ''].join(' ').trim();

  return (
    <div
      className={classes}
      role="timer"
      aria-live={critico ? 'assertive' : 'off'}
      aria-label={`Tempo restante: ${segundos} segundos`}
    >
      <svg viewBox="0 0 110 110" aria-hidden="true">
        <circle className="trilho" cx="55" cy="55" r={RAIO} />
        <circle
          className="progresso"
          cx="55"
          cy="55"
          r={RAIO}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={CIRCUNFERENCIA * (1 - fracao)}
        />
      </svg>
      <span className="numero mono" aria-hidden="true">
        {segundos}
      </span>
    </div>
  );
}
