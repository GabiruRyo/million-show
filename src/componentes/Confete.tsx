import { useMemo } from 'react';

const CORES = ['#f2c14e', '#ffd76a', '#ffffff', '#27c46a', '#2f45c5', '#e03a4a'];

interface Props {
  quantidade?: number;
}

export function Confete({ quantidade = 80 }: Props) {
  const pecas = useMemo(
    () =>
      Array.from({ length: quantidade }, (_, i) => ({
        id: i,
        esquerda: Math.random() * 100,
        atraso: Math.random() * 2.5,
        duracao: 2.6 + Math.random() * 2.4,
        cor: CORES[Math.floor(Math.random() * CORES.length)],
        rotacao: Math.random() * 360,
      })),
    [quantidade],
  );

  return (
    <div className="confete" aria-hidden="true">
      {pecas.map((p) => (
        <i
          key={p.id}
          style={{
            left: `${p.esquerda}%`,
            background: p.cor,
            animationDelay: `${p.atraso}s`,
            animationDuration: `${p.duracao}s`,
            transform: `rotate(${p.rotacao}deg)`,
          }}
        />
      ))}
    </div>
  );
}
