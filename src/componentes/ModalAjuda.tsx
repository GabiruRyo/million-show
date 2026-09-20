import type { Pergunta, ResultadoAjuda } from '../tipos';
import { LETRAS } from '../jogo/ajudas';

interface Props {
  resultado: ResultadoAjuda;
  pergunta: Pergunta;
  onFechar: () => void;
}

const CONFIANCA_TEXTO = {
  certeza: 'tem certeza',
  acho: 'está em dúvida',
  chute: 'está chutando',
} as const;

export function ModalAjuda({ resultado, pergunta, onFechar }: Props) {
  return (
    <div className="sobreposicao" role="dialog" aria-modal="true" onClick={onFechar}>
      <div className="painel painel-ouro modal" onClick={(e) => e.stopPropagation()}>
        {resultado.tipo === 'cartas' && (
          <>
            <h2 className="texto-ouro">🃏 As cartas eliminaram duas alternativas</h2>
            <p className="cinza">
              Sobraram apenas duas opções. As alternativas{' '}
              <strong>{resultado.eliminadas.map((i) => LETRAS[i]).join(' e ')}</strong> saíram do jogo.
            </p>
          </>
        )}

        {resultado.tipo === 'universitarios' && (
          <>
            <h2 className="texto-ouro">🎓 Ajuda dos universitários</h2>
            <div className="grade">
              {resultado.opinioes.map((opiniao, i) => (
                <div className="universitario" key={i}>
                  <span className="avatar" aria-hidden="true">🎓</span>
                  <div>
                    <strong>{opiniao.nome}</strong>{' '}
                    <span className="cinza pequeno">— {opiniao.curso}, {CONFIANCA_TEXTO[opiniao.confianca]}</span>
                    <p style={{ margin: '4px 0 0' }}>“{opiniao.fala}”</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="cinza pequeno" style={{ marginTop: 14 }}>
              {resultado.consenso !== null
                ? `A maioria dos universitários ficou com a letra ${LETRAS[resultado.consenso]}.`
                : 'Os universitários se dividiram — a decisão é toda sua.'}
            </p>
          </>
        )}

        {resultado.tipo === 'placas' && (
          <>
            <h2 className="texto-ouro">🪧 A plateia levantou as placas</h2>
            <div style={{ marginTop: 10 }}>
              {pergunta.alternativas.map((texto, i) => (
                <div className="barra-placa" key={i}>
                  <span className="letra" style={{ width: 28, height: 28 }} aria-hidden="true">{LETRAS[i]}</span>
                  <div className="trilho" title={texto}>
                    <div className="preenchimento" style={{ width: `${resultado.percentuais[i]}%` }} />
                  </div>
                  <span className="mono">{resultado.percentuais[i]}%</span>
                </div>
              ))}
            </div>
            <p className="cinza pequeno">A plateia erra bastante nas perguntas difíceis — use com cuidado.</p>
          </>
        )}

        <div className="linha" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="botao botao-ouro" onClick={onFechar} autoFocus>
            Voltar ao jogo
          </button>
        </div>
      </div>
    </div>
  );
}
