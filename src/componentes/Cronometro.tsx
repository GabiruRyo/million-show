interface Props {
  segundos: number;
  total: number;
}

export function Cronometro({ segundos, total }: Props) {
  if (total <= 0) return null;
  const critico = segundos <= 5;
  return (
    <div className={`cronometro ${critico ? 'critico' : ''}`} role="timer" aria-live="off">
      <span aria-hidden="true">⏱️</span>
      <span className="mono">{String(segundos).padStart(2, '0')}s</span>
    </div>
  );
}
