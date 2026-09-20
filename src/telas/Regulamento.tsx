import { Cabecalho } from '../componentes/Cabecalho';
import { PREMIOS, formatarReais } from '../dados/premios';
import { CATEGORIAS } from '../dados/categorias';
import { TOTAL_NO_BANCO } from '../dados/perguntas';

export function Regulamento() {
  return (
    <>
      <Cabecalho titulo="📜 Regulamento" />
      <div className="conteudo">
        <div className="painel painel-ouro" style={{ marginBottom: 18 }}>
          <h3 className="texto-ouro">Como se ganha o milhão</h3>
          <p>
            São <strong>16 perguntas</strong> de múltipla escolha, em ordem crescente de dificuldade.
            Cada acerto sobe um degrau na escada de prêmios. Errar encerra a partida — por isso existe o
            botão <strong>Parar</strong>, que garante o valor já acumulado.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="tabela">
              <thead>
                <tr><th>Pergunta</th><th>Vale</th><th>Dificuldade</th></tr>
              </thead>
              <tbody>
                {PREMIOS.map((valor, i) => (
                  <tr key={valor}>
                    <td className="mono">{i + 1}ª</td>
                    <td className="mono texto-ouro">{formatarReais(valor)}</td>
                    <td>{'⭐'.repeat(i < 3 ? 1 : i < 6 ? 2 : i < 9 ? 3 : i < 13 ? 4 : 5)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="painel" style={{ marginBottom: 18 }}>
          <h3 className="texto-ouro">As ajudas</h3>
          <ul style={{ lineHeight: 1.7 }}>
            <li><strong>🃏 Cartas</strong> — elimina duas alternativas erradas, deixando só duas opções. Uma vez por partida.</li>
            <li><strong>🎓 Universitários</strong> — três estudantes dão sua opinião. Quanto mais difícil a pergunta, mais eles erram. Uma vez por partida.</li>
            <li><strong>🪧 Placas</strong> — a plateia vota levantando placas e você vê os percentuais. Uma vez por partida.</li>
            <li><strong>⏭️ Pular</strong> — troca a pergunta atual por outra sem perder o acumulado. Três vezes por partida (configurável).</li>
            <li><strong>🛑 Parar</strong> — encerra a partida levando o valor já conquistado.</li>
          </ul>
        </div>

        <div className="painel" style={{ marginBottom: 18 }}>
          <h3 className="texto-ouro">A pergunta do milhão</h3>
          <p>
            Na 16ª pergunta você decide: responder e tentar <strong>{formatarReais(1_000_000)}</strong>, ou
            parar e levar <strong>{formatarReais(500_000)}</strong> para casa. Errar nessa altura significa
            sair sem nada — é o momento mais tenso do jogo.
          </p>
          <p className="cinza pequeno">
            Nos outros degraus, o que acontece ao errar depende do preset de regras escolhido em Configurações:
            metade do acumulado (clássico), nada (radical) ou o último patamar garantido.
          </p>
        </div>

        <div className="painel">
          <h3 className="texto-ouro">O banco de perguntas</h3>
          <p>
            São <strong>{TOTAL_NO_BANCO.toLocaleString('pt-BR')}</strong> perguntas autorais distribuídas em{' '}
            {CATEGORIAS.length} categorias e cinco níveis de dificuldade, com uma explicação para cada
            resposta. O jogo evita repetir perguntas já sorteadas nas últimas partidas.
          </p>
          <div className="escolha-categoria" style={{ marginTop: 12 }}>
            {CATEGORIAS.map((c) => (
              <div className="chip-categoria" key={c.id}>
                <span className="icone" aria-hidden="true">{c.icone}</span>
                <span>
                  {c.nome}
                  <span className="cinza pequeno" style={{ display: 'block', fontWeight: 400 }}>
                    {c.descricao}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
