import { useMemo } from 'react';
import { Cabecalho } from '../componentes/Cabecalho';
import { CATEGORIAS } from '../dados/categorias';
import { armazenamento } from '../armazenamento/local';
import { useLoja } from '../estado/loja';
import { contarPorCategoria } from '../dados/perguntas';

export function Estatisticas() {
  const historico = useLoja((e) => e.historico);
  const recarregar = useLoja((e) => e.recarregarDados);
  const estatisticas = useMemo(() => armazenamento.lerEstatisticas(), [historico]);
  const contagem = contarPorCategoria();

  const linhas = CATEGORIAS.map((categoria) => {
    const dados = estatisticas[categoria.id] ?? { acertos: 0, erros: 0 };
    const total = dados.acertos + dados.erros;
    const percentual = total > 0 ? Math.round((dados.acertos / total) * 100) : 0;
    return { categoria, ...dados, total, percentual };
  });

  const respondidas = linhas.reduce((s, l) => s + l.total, 0);
  const acertos = linhas.reduce((s, l) => s + l.acertos, 0);
  const geral = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;
  const ordenadas = [...linhas].filter((l) => l.total > 0).sort((a, b) => b.percentual - a.percentual);
  const melhor = ordenadas[0];
  const pior = ordenadas.length > 1 ? ordenadas[ordenadas.length - 1] : undefined;

  return (
    <>
      <Cabecalho titulo="📊 Estatísticas" />
      <div className="conteudo">
        <div className="linha" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="linha">
            <span className="etiqueta">📝 {respondidas} perguntas respondidas</span>
            <span className="etiqueta">✅ {acertos} acertos</span>
            <span className="etiqueta">🎯 {geral}% de aproveitamento geral</span>
          </div>
          <button
            className="botao botao-perigo botao-pequeno"
            onClick={() => {
              armazenamento.limparEstatisticas();
              recarregar();
            }}
          >
            Zerar estatísticas
          </button>
        </div>

        {ordenadas.length > 0 && (
          <div className="painel painel-ouro" style={{ marginBottom: 18 }}>
            <p style={{ margin: 0 }}>
              🥇 Você vai melhor em <strong>{melhor.categoria.nome}</strong> ({melhor.percentual}%)
              {/* Só sugere treino quando existe de fato uma categoria pior que a melhor. */}
              {pior && pior.percentual < melhor.percentual ? (
                <>
                  {' '}e precisa treinar <strong>{pior.categoria.nome}</strong> ({pior.percentual}%).
                </>
              ) : (
                '. Continue jogando para descobrir seus pontos fracos.'
              )}
            </p>
          </div>
        )}

        <div className="painel">
          <div className="grade">
            {linhas.map((linha) => (
              <div key={linha.categoria.id}>
                <div className="linha" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>
                    <span aria-hidden="true">{linha.categoria.icone}</span> {linha.categoria.nome}
                    <span className="cinza pequeno"> · {contagem[linha.categoria.id] ?? 0} no banco</span>
                  </span>
                  <span className="mono pequeno">
                    {linha.total > 0 ? `${linha.acertos}/${linha.total} · ${linha.percentual}%` : 'sem dados'}
                  </span>
                </div>
                <div className="barra-estatistica">
                  <div className="parte" style={{ width: `${linha.percentual}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
