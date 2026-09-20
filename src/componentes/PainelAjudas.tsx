import type { TipoAjuda } from '../tipos';

interface Props {
  disponiveis: Record<TipoAjuda, number>;
  desabilitado: boolean;
  onUsar: (tipo: TipoAjuda) => void;
  onParar: () => void;
  podeParar: boolean;
}

const AJUDAS: { tipo: TipoAjuda; icone: string; nome: string; descricao: string }[] = [
  { tipo: 'cartas', icone: '🃏', nome: 'Cartas', descricao: 'Elimina duas alternativas erradas' },
  { tipo: 'universitarios', icone: '🎓', nome: 'Universitários', descricao: 'Três estudantes opinam' },
  { tipo: 'placas', icone: '🪧', nome: 'Placas', descricao: 'A plateia vota nas placas' },
  { tipo: 'pular', icone: '⏭️', nome: 'Pular', descricao: 'Troca a pergunta sem perder nada' },
];

export function PainelAjudas({ disponiveis, desabilitado, onUsar, onParar, podeParar }: Props) {
  return (
    <div className="ajudas">
      {AJUDAS.map((ajuda) => (
        <button
          key={ajuda.tipo}
          className="ajuda"
          onClick={() => onUsar(ajuda.tipo)}
          disabled={desabilitado || disponiveis[ajuda.tipo] <= 0}
          title={ajuda.descricao}
        >
          <span className="icone" aria-hidden="true">{ajuda.icone}</span>
          <span>{ajuda.nome}</span>
          <span className="restante">
            {disponiveis[ajuda.tipo] > 0 ? `${disponiveis[ajuda.tipo]} disponível` : 'usada'}
          </span>
        </button>
      ))}
      {podeParar && (
        <button className="ajuda" onClick={onParar} disabled={desabilitado} title="Encerra a partida levando o valor acumulado">
          <span className="icone" aria-hidden="true">🛑</span>
          <span>Parar</span>
          <span className="restante">levar o prêmio</span>
        </button>
      )}
    </div>
  );
}
