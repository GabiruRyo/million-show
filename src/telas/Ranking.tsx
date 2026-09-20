import { useMemo, useState } from 'react';
import { useLoja } from '../estado/loja';
import { Cabecalho } from '../componentes/Cabecalho';
import { formatarReais } from '../dados/premios';
import { dataBrasileira, horaBrasileira } from '../utilitarios/extenso';
import { armazenamento } from '../armazenamento/local';

const NOME_MODO: Record<string, string> = {
  classico: 'Clássico',
  treino: 'Treino',
  'contra-relogio': 'Contra-relógio',
  sobrevivencia: 'Sobrevivência',
  duelo: 'Duelo',
};

export function Ranking() {
  const historico = useLoja((e) => e.historico);
  const recarregar = useLoja((e) => e.recarregarDados);
  const [filtro, setFiltro] = useState<string>('todos');

  const filtrado = useMemo(
    () => (filtro === 'todos' ? historico : historico.filter((r) => r.modo === filtro)),
    [historico, filtro],
  );

  const melhores = useMemo(
    () => [...filtrado].sort((a, b) => b.premio - a.premio || b.pontos - a.pontos).slice(0, 10),
    [filtrado],
  );

  const totalGanho = historico.reduce((soma, r) => soma + r.premio, 0);
  const milhoes = historico.filter((r) => r.motivoFim === 'acertou-milhao').length;

  return (
    <>
      <Cabecalho titulo="🏆 Hall da Fama" />
      <div className="conteudo">
        <div className="linha" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="linha">
            <span className="etiqueta">🎮 {historico.length} partidas</span>
            <span className="etiqueta">💰 {formatarReais(totalGanho)} acumulados</span>
            <span className="etiqueta">👑 {milhoes} milhão(ões) conquistado(s)</span>
          </div>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(3,6,29,0.8)', color: 'var(--branco)', border: '1px solid rgba(143,160,255,0.3)' }}
            aria-label="Filtrar por modo"
          >
            <option value="todos">Todos os modos</option>
            {Object.entries(NOME_MODO).map(([chave, nome]) => (
              <option key={chave} value={chave}>{nome}</option>
            ))}
          </select>
        </div>

        {historico.length === 0 ? (
          <div className="painel centro">
            <p>Nenhuma partida registrada ainda. Jogue para entrar no Hall da Fama!</p>
          </div>
        ) : (
          <>
            <div className="painel painel-ouro" style={{ marginBottom: 18 }}>
              <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Melhores resultados</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="tabela">
                  <thead>
                    <tr>
                      <th>#</th><th>Jogador</th><th>Modo</th><th>Prêmio</th><th>Acertos</th><th>Pontos</th><th>Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {melhores.map((registro, i) => (
                      <tr key={registro.id}>
                        <td className="mono">{i + 1}º</td>
                        <td>{registro.avatar} {registro.jogador}</td>
                        <td className="pequeno">{NOME_MODO[registro.modo] ?? registro.modo}</td>
                        <td className="mono texto-ouro">{formatarReais(registro.premio)}</td>
                        <td className="mono">{registro.acertos}</td>
                        <td className="mono">{registro.pontos}</td>
                        <td className="pequeno cinza">{dataBrasileira(registro.data)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="painel">
              <div className="linha" style={{ justifyContent: 'space-between' }}>
                <h3 className="texto-ouro" style={{ fontSize: '1rem', margin: 0 }}>Histórico completo</h3>
                <button
                  className="botao botao-perigo botao-pequeno"
                  onClick={() => {
                    armazenamento.limparHistorico();
                    recarregar();
                  }}
                >
                  Apagar histórico
                </button>
              </div>
              <div style={{ overflowX: 'auto', marginTop: 10 }}>
                <table className="tabela">
                  <thead>
                    <tr><th>Data</th><th>Modo</th><th>Resultado</th><th>Prêmio</th><th>Acertos</th></tr>
                  </thead>
                  <tbody>
                    {filtrado.map((registro) => (
                      <tr key={registro.id}>
                        <td className="pequeno cinza">
                          {dataBrasileira(registro.data)} às {horaBrasileira(registro.data)}
                        </td>
                        <td className="pequeno">{NOME_MODO[registro.modo] ?? registro.modo}</td>
                        <td className="pequeno">
                          {registro.motivoFim === 'acertou-milhao' && '👑 ganhou o milhão'}
                          {registro.motivoFim === 'parou' && '🛑 parou'}
                          {registro.motivoFim === 'errou' && '❌ errou'}
                          {registro.motivoFim === 'tempo' && '⏱️ tempo esgotado'}
                        </td>
                        <td className="mono">{formatarReais(registro.premio)}</td>
                        <td className="mono">{registro.acertos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
