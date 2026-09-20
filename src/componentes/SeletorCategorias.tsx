import type { CategoriaId } from '../tipos';
import { CATEGORIAS } from '../dados/categorias';

interface Props {
  selecionadas: CategoriaId[];
  onAlternar: (id: CategoriaId) => void;
  onTodas: () => void;
  contagem?: Record<CategoriaId, number>;
}

export function SeletorCategorias({ selecionadas, onAlternar, onTodas, contagem }: Props) {
  return (
    <>
      <div className="linha" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="cinza pequeno">
          {selecionadas.length === 0
            ? 'Nenhuma categoria escolhida — o jogo usa todas.'
            : `${selecionadas.length} categoria(s) escolhida(s)`}
        </span>
        <button className="botao botao-fantasma botao-pequeno" onClick={onTodas}>
          {selecionadas.length > 0 ? 'Limpar seleção' : 'Usar todas'}
        </button>
      </div>
      <div className="escolha-categoria">
        {CATEGORIAS.map((categoria) => (
          <button
            key={categoria.id}
            className={`chip-categoria ${selecionadas.includes(categoria.id) ? 'ativo' : ''}`}
            onClick={() => onAlternar(categoria.id)}
            aria-pressed={selecionadas.includes(categoria.id)}
          >
            <span className="icone" aria-hidden="true">{categoria.icone}</span>
            <span>
              {categoria.nome}
              {contagem && (
                <span className="cinza pequeno" style={{ display: 'block', fontWeight: 400 }}>
                  {contagem[categoria.id] ?? 0} perguntas
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
