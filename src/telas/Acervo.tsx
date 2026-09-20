import { useMemo, useState } from 'react';
import { Cabecalho } from '../componentes/Cabecalho';
import { CATEGORIAS, CATEGORIA_POR_ID } from '../dados/categorias';
import { useBanco } from '../estado/loja';
import { LETRAS } from '../jogo/ajudas';
import { normalizar } from '../utilitarios/extenso';
import type { CategoriaId, Nivel } from '../tipos';

const POR_PAGINA = 25;

export function Acervo() {
  const banco = useBanco();
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState<CategoriaId | 'todas'>('todas');
  const [nivel, setNivel] = useState<Nivel | 0>(0);
  const [pagina, setPagina] = useState(0);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());

  const filtradas = useMemo(() => {
    const termo = normalizar(busca);
    return banco.filter((p) => {
      if (categoria !== 'todas' && p.categoria !== categoria) return false;
      if (nivel !== 0 && p.nivel !== nivel) return false;
      if (!termo) return true;
      return (
        normalizar(p.enunciado).includes(termo) ||
        p.alternativas.some((a) => normalizar(a).includes(termo)) ||
        normalizar(p.explicacao).includes(termo)
      );
    });
  }, [banco, busca, categoria, nivel]);

  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, paginas - 1);
  const visiveis = filtradas.slice(paginaAtual * POR_PAGINA, (paginaAtual + 1) * POR_PAGINA);

  function alternarAberta(id: string) {
    setAbertas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  return (
    <>
      <Cabecalho titulo="📚 Acervo de perguntas" />
      <div className="conteudo">
        <div className="painel" style={{ marginBottom: 16 }}>
          <div className="linha">
            <div className="campo" style={{ flex: '2 1 260px', marginBottom: 0 }}>
              <label htmlFor="busca">Buscar</label>
              <input
                id="busca"
                value={busca}
                placeholder="Ex.: Tiradentes, tabela periódica, Pelé..."
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPagina(0);
                }}
              />
            </div>
            <div className="campo" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value as CategoriaId | 'todas');
                  setPagina(0);
                }}
              >
                <option value="todas">Todas as categorias</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
                ))}
              </select>
            </div>
            <div className="campo" style={{ flex: '0 1 150px', marginBottom: 0 }}>
              <label htmlFor="nivel">Nível</label>
              <select
                id="nivel"
                value={nivel}
                onChange={(e) => {
                  setNivel(Number(e.target.value) as Nivel | 0);
                  setPagina(0);
                }}
              >
                <option value={0}>Todos</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>Nível {n}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="cinza pequeno" style={{ margin: '12px 0 0' }}>
            {filtradas.length.toLocaleString('pt-BR')} pergunta(s) encontrada(s) de{' '}
            {banco.length.toLocaleString('pt-BR')} no banco.
          </p>
        </div>

        <div className="grade">
          {visiveis.map((pergunta) => {
            const aberta = abertas.has(pergunta.id);
            const categoriaInfo = CATEGORIA_POR_ID[pergunta.categoria];
            return (
              <div className="painel" key={pergunta.id} style={{ padding: 16 }}>
                <div className="linha" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="etiqueta">{categoriaInfo?.icone} {categoriaInfo?.nomeCurto}</span>
                  <span className="etiqueta">{'⭐'.repeat(pergunta.nivel)}</span>
                </div>
                <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{pergunta.enunciado}</p>
                <button className="botao botao-fantasma botao-pequeno" onClick={() => alternarAberta(pergunta.id)}>
                  {aberta ? 'Esconder resposta' : 'Ver resposta'}
                </button>
                {aberta && (
                  <div style={{ marginTop: 10 }}>
                    <ul style={{ margin: '0 0 10px', paddingLeft: 18 }}>
                      {pergunta.alternativas.map((texto, i) => (
                        <li
                          key={i}
                          style={{
                            color: i === pergunta.correta ? 'var(--verde)' : 'var(--cinza-claro)',
                            fontWeight: i === pergunta.correta ? 700 : 400,
                          }}
                        >
                          {LETRAS[i]}) {texto} {i === pergunta.correta && '✅'}
                        </li>
                      ))}
                    </ul>
                    <div className="explicacao" style={{ marginTop: 0 }}>{pergunta.explicacao}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {paginas > 1 && (
          <div className="linha" style={{ justifyContent: 'center', marginTop: 20 }}>
            <button
              className="botao botao-fantasma botao-pequeno"
              disabled={paginaAtual === 0}
              onClick={() => setPagina(paginaAtual - 1)}
            >
              ← Anterior
            </button>
            <span className="mono pequeno">
              Página {paginaAtual + 1} de {paginas}
            </span>
            <button
              className="botao botao-fantasma botao-pequeno"
              disabled={paginaAtual >= paginas - 1}
              onClick={() => setPagina(paginaAtual + 1)}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
