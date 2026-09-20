import { useEffect } from 'react';
import { useLoja } from '../estado/loja';
import { ChequePremiado } from '../componentes/ChequePremiado';
import { Confete } from '../componentes/Confete';
import { Logo } from '../componentes/Logo';
import { formatarReais } from '../dados/premios';
import { CATEGORIA_POR_ID } from '../dados/categorias';
import { LETRAS } from '../jogo/ajudas';
import { som } from '../audio/sintetizador';

const MENSAGEM_CLASSICO: Record<string, string> = {
  'acertou-milhao': '🎉 Você ganhou o MILHÃO! Entrou para a história do programa!',
  errou: 'Que pena! A resposta não era essa. Mas você levou seu prêmio.',
  parou: 'Você parou na hora certa e garantiu o prêmio!',
  tempo: 'O tempo acabou! O relógio é um adversário duro.',
};

/** Nos modos livres não há prêmio em dinheiro, então a mensagem é outra. */
const MENSAGEM_LIVRE: Record<string, string> = {
  'acertou-milhao': '🎉 Você respondeu todas as perguntas da rodada!',
  errou: 'Fim de jogo! Confira abaixo onde você escorregou.',
  parou: 'Rodada encerrada! Veja como foi o seu desempenho.',
  tempo: 'O tempo acabou! O relógio é um adversário duro.',
};

export function FimDeJogo() {
  const partida = useLoja((e) => e.partida);
  const perfil = useLoja((e) => e.perfil);
  const config = useLoja((e) => e.config);
  const irPara = useLoja((e) => e.irPara);
  const iniciarClassico = useLoja((e) => e.iniciarClassico);

  const ganhouMuito = (partida?.premioFinal ?? 0) >= 100_000 || partida?.motivoFim === 'acertou-milhao';

  useEffect(() => {
    if (config.som && ganhouMuito) som.fanfarra();
  }, [config.som, ganhouMuito]);

  const classico = partida?.modo === 'classico';

  if (!partida) {
    return (
      <div className="conteudo centro">
        <p>Nada por aqui.</p>
        <button className="botao botao-ouro" onClick={() => irPara('menu')}>Voltar ao menu</button>
      </div>
    );
  }

  const acertos = partida.historico.filter((r) => r.acertou).length;
  const respondidas = partida.historico.filter((r) => !r.pulada).length;
  const aproveitamento = respondidas > 0 ? Math.round((acertos / respondidas) * 100) : 0;

  return (
    <>
      {ganhouMuito && config.animacoes && <Confete quantidade={partida.motivoFim === 'acertou-milhao' ? 140 : 70} />}
      <div className="conteudo">
        <Logo compacto={false} />
        <h2 className="centro texto-ouro" style={{ marginTop: -4 }}>
          {(classico ? MENSAGEM_CLASSICO : MENSAGEM_LIVRE)[partida.motivoFim ?? 'parou']}
        </h2>

        {classico ? (
          <div style={{ margin: '22px 0' }}>
            <ChequePremiado valor={partida.premioFinal} nome={perfil?.nome ?? 'Participante'} />
          </div>
        ) : (
          <div className="painel painel-ouro centro" style={{ maxWidth: 460, margin: '22px auto' }}>
            <p className="cinza pequeno" style={{ letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Pontuação final
            </p>
            <p className="texto-ouro mono" style={{ fontSize: '3rem', margin: 0, fontFamily: 'var(--fonte-titulo)' }}>
              {partida.pontos}
            </p>
          </div>
        )}

        <div className="linha" style={{ justifyContent: 'center', marginBottom: 20 }}>
          <span className="etiqueta">✅ {acertos} acertos</span>
          <span className="etiqueta">🎯 {aproveitamento}% de aproveitamento</span>
          <span className="etiqueta">⏭️ {partida.historico.filter((r) => r.pulada).length} puladas</span>
          {classico && <span className="etiqueta">💰 {formatarReais(partida.premioFinal)}</span>}
        </div>

        <div className="painel">
          <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Como foi cada pergunta</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="tabela">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Pergunta</th>
                  <th>Categoria</th>
                  <th>Sua resposta</th>
                  <th>Gabarito</th>
                </tr>
              </thead>
              <tbody>
                {partida.historico.map((registro, i) => (
                  <tr key={registro.perguntaId + i}>
                    <td className="mono">{i + 1}</td>
                    <td style={{ maxWidth: 380 }}>{registro.enunciado}</td>
                    <td className="pequeno">{CATEGORIA_POR_ID[registro.categoria]?.nomeCurto}</td>
                    <td>
                      {registro.pulada ? (
                        <span className="cinza">pulada</span>
                      ) : registro.escolha === null ? (
                        <span style={{ color: 'var(--vermelho)' }}>tempo esgotado</span>
                      ) : (
                        <span style={{ color: registro.acertou ? 'var(--verde)' : 'var(--vermelho)' }}>
                          {LETRAS[registro.escolha]} {registro.acertou ? '✅' : '❌'}
                        </span>
                      )}
                    </td>
                    <td className="mono">{LETRAS[registro.correta]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="linha" style={{ justifyContent: 'center', marginTop: 24 }}>
          {classico ? (
            <button className="botao botao-ouro botao-grande" onClick={iniciarClassico}>
              🔁 Jogar de novo
            </button>
          ) : (
            <button className="botao botao-ouro botao-grande" onClick={() => irPara('modos')}>
              🎮 Escolher outro modo
            </button>
          )}
          <button className="botao botao-fantasma" onClick={() => irPara('ranking')}>
            🏆 Ver Hall da Fama
          </button>
          <button className="botao botao-fantasma" onClick={() => irPara('menu')}>
            🏠 Menu principal
          </button>
        </div>
      </div>
    </>
  );
}
