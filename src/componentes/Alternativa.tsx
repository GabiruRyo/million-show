import type { IndiceAlternativa } from '../tipos';
import { LETRAS } from '../jogo/ajudas';

interface Props {
  indice: IndiceAlternativa;
  texto: string;
  selecionada: boolean;
  eliminada: boolean;
  revelada: boolean;
  correta: boolean;
  suspense: boolean;
  onEscolher: (indice: IndiceAlternativa) => void;
}

export function Alternativa({
  indice,
  texto,
  selecionada,
  eliminada,
  revelada,
  correta,
  suspense,
  onEscolher,
}: Props) {
  const classes = ['alternativa'];
  if (eliminada) classes.push('eliminada');
  if (selecionada && !revelada) classes.push('selecionada');
  if (suspense && selecionada) classes.push('piscando');
  if (revelada && correta) classes.push('correta');
  if (revelada && selecionada && !correta) classes.push('errada');

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={() => onEscolher(indice)}
      disabled={eliminada || revelada || suspense}
      aria-pressed={selecionada}
      aria-label={`Alternativa ${LETRAS[indice]}: ${texto}`}
    >
      <span className="letra" aria-hidden="true">{LETRAS[indice]}</span>
      <span>{texto}</span>
    </button>
  );
}
