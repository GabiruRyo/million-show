import { useLoja } from '../estado/loja';
import { Cabecalho } from '../componentes/Cabecalho';
import { Alternativa } from '../componentes/Alternativa';
import { Confete } from '../componentes/Confete';
import { CATEGORIA_POR_ID } from '../dados/categorias';
import { LETRAS } from '../jogo/ajudas';
import { som } from '../audio/sintetizador';
import type { IndiceAlternativa } from '../tipos';

export function Duelo() {
  const duelo = useLoja((e) => e.duelo);
  const config = useLoja((e) => e.config);
  const escolher = useLoja((e) => e.duelorEscolher);
  const revelar = useLoja((e) => e.duelorRevelar);
  const avancar = useLoja((e) => e.duelorAvancar);
  const irPara = useLoja((e) => e.irPara);

  if (!duelo) {
    return (
      <div className="conteudo centro">
        <p>Nenhum duelo em andamento.</p>
        <button className="botao botao-ouro" onClick={() => irPara('modos')}>Configurar duelo</button>
      </div>
    );
  }

  if (duelo.fase === 'encerrada') {
    const vencedor =
      duelo.pontos[0] === duelo.pontos[1] ? null : duelo.pontos[0] > duelo.pontos[1] ? 0 : 1;
    return (
      <>
        {config.animacoes && <Confete quantidade={90} />}
        <Cabecalho titulo="⚔️ Fim do duelo" />
        <div className="conteudo centro">
          <h2 className="texto-ouro" style={{ fontSize: '2rem' }}>
            {vencedor === null ? '🤝 Empate!' : `🏆 ${duelo.nomes[vencedor]} venceu!`}
          </h2>
          <div className="linha" style={{ justifyContent: 'center', margin: '20px 0' }}>
            {[0, 1].map((j) => (
              <div className="painel painel-ouro" key={j} style={{ minWidth: 200 }}>
                <p style={{ margin: 0, fontWeight: 700 }}>{duelo.nomes[j]}</p>
                <p className="texto-ouro mono" style={{ fontSize: '2.4rem', margin: '6px 0', fontFamily: 'var(--fonte-titulo)' }}>
                  {duelo.pontos[j]}
                </p>
                <p className="cinza pequeno">{duelo.acertos[j]} acertos em 6 perguntas</p>
              </div>
            ))}
          </div>
          <div className="linha" style={{ justifyContent: 'center' }}>
            <button className="botao botao-ouro" onClick={() => irPara('modos')}>Novo duelo</button>
            <button className="botao botao-fantasma" onClick={() => irPara('menu')}>Menu principal</button>
          </div>
        </div>
      </>
    );
  }

  const pergunta = duelo.perguntas[duelo.indice];
  const categoria = CATEGORIA_POR_ID[pergunta.categoria];
  const revelado = duelo.fase === 'revelado';
  const acertou = revelado && duelo.escolha === pergunta.correta;

  return (
    <>
      <Cabecalho titulo="⚔️ Duelo" />
      <div className="conteudo">
        <div className="linha" style={{ justifyContent: 'center', marginBottom: 14 }}>
          {[0, 1].map((j) => (
            <span
              key={j}
              className="etiqueta"
              style={
                duelo.vez === j
                  ? { borderColor: 'var(--ouro-400)', background: 'rgba(242,193,78,0.18)', fontSize: '0.95rem' }
                  : { opacity: 0.6 }
              }
            >
              {duelo.vez === j ? '▶ ' : ''}{duelo.nomes[j]}: {duelo.pontos[j]} pts
            </span>
          ))}
        </div>

        <div className="faixa-pergunta">
          <span className="etiqueta">{categoria.icone} {categoria.nome} · nível {pergunta.nivel}</span>
          <span className="valor-em-jogo texto-ouro">
            Pergunta {duelo.indice + 1} de {duelo.perguntas.length}
          </span>
        </div>

        <div className="enunciado" key={pergunta.id}>
          <h2 style={{ margin: 0, fontFamily: 'var(--fonte)', fontWeight: 600 }}>{pergunta.enunciado}</h2>
        </div>

        <p className="centro texto-ouro" style={{ marginTop: 12 }}>
          Vez de <strong>{duelo.nomes[duelo.vez]}</strong> — vale {pergunta.nivel * 100} pontos
        </p>

        <div className="alternativas">
          {pergunta.alternativas.map((texto, i) => (
            <Alternativa
              key={i}
              indice={i as IndiceAlternativa}
              texto={texto}
              selecionada={duelo.escolha === i}
              eliminada={false}
              revelada={revelado}
              correta={pergunta.correta === i}
              suspense={false}
              onEscolher={(indice) => {
                if (config.som) som.selecionar();
                escolher(indice);
              }}
            />
          ))}
        </div>

        <div className="linha" style={{ justifyContent: 'center', marginTop: 18 }}>
          {!revelado ? (
            <button
              className="botao botao-ouro botao-grande"
              disabled={duelo.escolha === null}
              onClick={() => {
                if (config.som) som.confirmar();
                revelar();
              }}
            >
              Confirmar resposta
            </button>
          ) : (
            <button
              className="botao botao-ouro botao-grande"
              onClick={() => {
                if (config.som) som.clique();
                avancar();
              }}
              autoFocus
            >
              Passar a vez →
            </button>
          )}
        </div>

        {revelado && (
          <div className="explicacao">
            <strong>
              {acertou ? '✅ Acertou!' : '❌ Errou.'} A resposta certa é a letra {LETRAS[pergunta.correta]} —{' '}
              {pergunta.alternativas[pergunta.correta]}
            </strong>
            <p style={{ margin: '8px 0 0' }}>{pergunta.explicacao}</p>
          </div>
        )}
      </div>
    </>
  );
}
