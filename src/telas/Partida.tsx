import { useEffect, useRef, useState } from 'react';
import { useLoja } from '../estado/loja';
import { EscadaPremios } from '../componentes/EscadaPremios';
import { Alternativa } from '../componentes/Alternativa';
import { PainelAjudas } from '../componentes/PainelAjudas';
import { ModalAjuda } from '../componentes/ModalAjuda';
import { Cronometro } from '../componentes/Cronometro';
import { Cabecalho } from '../componentes/Cabecalho';
import { CATEGORIA_POR_ID } from '../dados/categorias';
import { PREMIOS, formatarPremioCurto, formatarReais } from '../dados/premios';
import { LETRAS, falaDoApresentador } from '../jogo/ajudas';
import { criarRng } from '../jogo/aleatorio';
import { ehPerguntaDoMilhao, perguntaAtual } from '../jogo/maquina';
import { tempoDaPergunta } from '../jogo/regras';
import { pararSuspense, som } from '../audio/sintetizador';
import type { IndiceAlternativa } from '../tipos';

const TEMPO_SUSPENSE = 2600;

export function Partida() {
  const partida = useLoja((e) => e.partida);
  const config = useLoja((e) => e.config);
  const escolher = useLoja((e) => e.escolher);
  const confirmarResposta = useLoja((e) => e.confirmarResposta);
  const revelarResposta = useLoja((e) => e.revelarResposta);
  const avancar = useLoja((e) => e.avancar);
  const acionarAjuda = useLoja((e) => e.acionarAjuda);
  const dispensarAjuda = useLoja((e) => e.dispensarAjuda);
  const pararAgora = useLoja((e) => e.pararAgora);
  const tiqueCronometro = useLoja((e) => e.tiqueCronometro);
  const irPara = useLoja((e) => e.irPara);

  const [confirmando, setConfirmando] = useState(false);
  const [fala, setFala] = useState('');
  const escolhaRef = useRef<IndiceAlternativa | null>(null);

  const pergunta = partida ? perguntaAtual(partida) : undefined;
  const fase = partida?.fase;
  const tempoRestante = partida?.tempoRestante ?? 0;
  const tempoTotal = partida ? tempoDaPergunta(partida.regras, partida.indice) : 0;
  const revelado = fase === 'revelado' || fase === 'encerrada';
  const suspense = fase === 'suspense';

  escolhaRef.current = partida?.escolha ?? null;

  // Suspense → revelação
  useEffect(() => {
    if (fase !== 'suspense') return;
    if (config.som) som.suspense();
    const rng = criarRng(Date.now() % 100000);
    setFala(falaDoApresentador(rng, 'suspense'));
    const temporizador = window.setTimeout(() => {
      pararSuspense();
      revelarResposta();
    }, config.animacoes ? TEMPO_SUSPENSE : 400);
    return () => {
      window.clearTimeout(temporizador);
      pararSuspense();
    };
  }, [fase, config.som, config.animacoes, revelarResposta]);

  // Som e fala da revelação
  useEffect(() => {
    if (fase !== 'revelado' && fase !== 'encerrada') return;
    const ultima = partida?.historico[partida.historico.length - 1];
    if (!ultima) return;
    // Sem escolha e sem pulo significa que o relógio zerou.
    const porTempo = ultima.escolha === null && !ultima.pulada;
    const rng = criarRng(Date.now() % 100000);
    setFala(falaDoApresentador(rng, ultima.acertou ? 'acerto' : porTempo ? 'tempo' : 'erro'));
    if (config.som) {
      if (ultima.acertou) som.acerto();
      else if (porTempo) som.tempoEsgotado();
      else som.erro();
    }
  }, [fase, partida?.historico.length, config.som]);

  // Cronômetro
  useEffect(() => {
    if (!partida || partida.fase !== 'respondendo' || partida.regras.tempoPorPergunta === 0) return;
    const intervalo = window.setInterval(() => tiqueCronometro(), 1000);
    return () => window.clearInterval(intervalo);
  }, [partida?.fase, partida?.indice, partida?.regras.tempoPorPergunta, tiqueCronometro, partida]);

  useEffect(() => {
    if (fase !== 'respondendo' || !config.som || tempoTotal <= 0 || tempoRestante <= 0) return;
    som.tique(tempoRestante, tempoTotal);
  }, [tempoRestante, tempoTotal, fase, config.som]);

  // Atalhos de teclado
  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (!partida || partida.fase !== 'respondendo') {
        if (evento.key === 'Enter' && (partida?.fase === 'revelado')) avancar();
        return;
      }
      const tecla = evento.key.toUpperCase();
      const porLetra = LETRAS.indexOf(tecla as (typeof LETRAS)[number]);
      const porNumero = ['1', '2', '3', '4'].indexOf(tecla);
      const indice = porLetra >= 0 ? porLetra : porNumero;
      if (indice >= 0) {
        evento.preventDefault();
        aoEscolher(indice as IndiceAlternativa);
      } else if (evento.key === 'Enter' && escolhaRef.current !== null) {
        evento.preventDefault();
        setConfirmando(true);
      }
    }
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  });

  if (!partida || !pergunta) {
    return (
      <div className="conteudo centro">
        <p>Nenhuma partida em andamento.</p>
        <button className="botao botao-ouro" onClick={() => irPara('menu')}>Voltar ao menu</button>
      </div>
    );
  }

  const categoria = CATEGORIA_POR_ID[pergunta.categoria];
  const classico = partida.modo === 'classico';
  const valorEmJogo = classico ? PREMIOS[partida.indice] : 0;
  const ultima = partida.historico[partida.historico.length - 1];

  function aoEscolher(indice: IndiceAlternativa) {
    if (config.som) som.selecionar();
    escolher(indice);
  }

  function aoConfirmar() {
    setConfirmando(false);
    if (config.som) som.confirmar();
    confirmarResposta();
  }

  return (
    <>
      <Cabecalho
        voltarPara="menu"
        acao={
          <span className="linha" style={{ gap: 10 }}>
            {partida.modo === 'sobrevivencia' && (
              <span className="etiqueta">{'❤️'.repeat(Math.max(0, partida.vidas))}</span>
            )}
            {!classico && <span className="etiqueta">⭐ {partida.pontos} pts</span>}
          </span>
        }
      />
      <div className="conteudo">
        <div className="jogo">
          <main className="jogo-principal">
            <div className="faixa-pergunta">
              <span className="etiqueta" style={{ borderColor: categoria.cor }}>
                {categoria.icone} {categoria.nome} · nível {pergunta.nivel}
              </span>
              <span className="valor-em-jogo texto-ouro">
                {classico
                  ? `Pergunta ${partida.indice + 1} de 16 · ${formatarPremioCurto(valorEmJogo)}`
                  : `Pergunta ${partida.indice + 1} de ${partida.perguntas.length}`}
              </span>
            </div>

            <Cronometro segundos={tempoRestante} total={tempoTotal} />

            <div className="enunciado" key={pergunta.id}>
              <h2 style={{ margin: 0, fontFamily: 'var(--fonte)', fontWeight: 600 }}>
                {pergunta.enunciado}
              </h2>
            </div>

            <div className="alternativas" role="group" aria-label="Alternativas">
              {pergunta.alternativas.map((texto, i) => (
                <Alternativa
                  key={i}
                  indice={i as IndiceAlternativa}
                  texto={texto}
                  selecionada={partida.escolha === i}
                  eliminada={partida.eliminadas.includes(i as IndiceAlternativa)}
                  revelada={revelado}
                  correta={pergunta.correta === i}
                  suspense={suspense}
                  onEscolher={aoEscolher}
                />
              ))}
            </div>

            <div aria-live="polite" className="cinza pequeno" style={{ minHeight: 22, marginTop: 10 }}>
              {suspense || revelado ? fala : 'Escolha uma alternativa (teclas A, B, C, D) e confirme.'}
            </div>

            {partida.fase === 'respondendo' && (
              <>
                {classico && (
                  <PainelAjudas
                    disponiveis={partida.ajudasDisponiveis}
                    desabilitado={false}
                    onUsar={(tipo) => {
                      if (config.som) som.ajuda();
                      acionarAjuda(tipo);
                    }}
                    onParar={() => {
                      if (config.som) som.parar();
                      pararAgora();
                    }}
                    podeParar={partida.acumulado > 0}
                  />
                )}
                <div className="linha" style={{ marginTop: 16, justifyContent: 'center' }}>
                  <button
                    className="botao botao-ouro botao-grande"
                    disabled={partida.escolha === null}
                    onClick={() => setConfirmando(true)}
                  >
                    {partida.escolha === null
                      ? 'Escolha uma alternativa'
                      : `Confirmar letra ${LETRAS[partida.escolha]}`}
                  </button>
                </div>
              </>
            )}

            {revelado && ultima && (
              <>
                {config.mostrarExplicacao && (
                  <div className="explicacao">
                    <strong>
                      {ultima.acertou ? '✅ Resposta certa' : '❌ Resposta certa'}: letra{' '}
                      {LETRAS[pergunta.correta]} — {pergunta.alternativas[pergunta.correta]}
                    </strong>
                    <p style={{ margin: '8px 0 0' }}>{pergunta.explicacao}</p>
                  </div>
                )}
                <div className="linha" style={{ marginTop: 18, justifyContent: 'center' }}>
                  <button className="botao botao-ouro botao-grande" onClick={avancar} autoFocus>
                    {partida.motivoFim ? 'Ver resultado final' : 'Próxima pergunta →'}
                  </button>
                </div>
              </>
            )}
          </main>

          {classico ? (
            <EscadaPremios indiceAtual={partida.indice} patamares={partida.regras.patamares} />
          ) : (
            <aside className="escada-lateral">
              <div className="painel">
                <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Desempenho</h3>
                <p className="mono" style={{ fontSize: '1.6rem', margin: '4px 0' }}>{partida.pontos} pts</p>
                <p className="cinza pequeno">
                  {partida.historico.filter((r) => r.acertou).length} acertos em{' '}
                  {partida.historico.length} respostas
                </p>
                {partida.modo === 'sobrevivencia' && (
                  <p className="pequeno">Vidas restantes: {'❤️'.repeat(Math.max(0, partida.vidas)) || 'nenhuma'}</p>
                )}
                <button
                  className="botao botao-fantasma botao-pequeno"
                  style={{ marginTop: 10, width: '100%' }}
                  onClick={pararAgora}
                >
                  Encerrar e ver resumo
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>

      {partida.ajudaAtiva && (
        <ModalAjuda resultado={partida.ajudaAtiva} pergunta={pergunta} onFechar={dispensarAjuda} />
      )}

      {confirmando && partida.escolha !== null && (
        <div className="sobreposicao" role="dialog" aria-modal="true">
          <div className="painel painel-ouro modal centro">
            <h2 className="texto-ouro">Você tem certeza?</h2>
            <p style={{ fontSize: '1.05rem' }}>
              Sua resposta é a letra <strong>{LETRAS[partida.escolha]}</strong>:{' '}
              {pergunta.alternativas[partida.escolha]}
            </p>
            {classico && (
              <p className="cinza pequeno">
                {ehPerguntaDoMilhao(partida)
                  ? 'Se errar a pergunta do milhão, você vai para casa sem nada. Se parar agora, leva R$ 500 mil.'
                  : `Acertando, você garante ${formatarReais(PREMIOS[partida.indice])}.`}
              </p>
            )}
            <div className="linha" style={{ justifyContent: 'center', marginTop: 16 }}>
              <button className="botao botao-fantasma" onClick={() => setConfirmando(false)}>
                Pensar mais um pouco
              </button>
              <button className="botao botao-ouro" onClick={aoConfirmar} autoFocus>
                Sim, é essa!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
