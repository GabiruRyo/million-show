import { Cabecalho } from '../componentes/Cabecalho';
import { useLoja } from '../estado/loja';
import { DESCRICAO_PRESET, REGRAS_PRESET } from '../jogo/regras';
import { armazenamento } from '../armazenamento/local';
import { som } from '../audio/sintetizador';
import type { PresetRegra } from '../tipos';

export function Configuracoes() {
  const config = useLoja((e) => e.config);
  const atualizar = useLoja((e) => e.atualizarConfig);
  const perfil = useLoja((e) => e.perfil);
  const definirPerfil = useLoja((e) => e.definirPerfil);
  const recarregar = useLoja((e) => e.recarregarDados);

  return (
    <>
      <Cabecalho titulo="⚙️ Configurações" />
      <div className="conteudo">
        <div className="painel" style={{ marginBottom: 18 }}>
          <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Regras da partida clássica</h3>
          <div className="grade">
            {(Object.keys(REGRAS_PRESET) as PresetRegra[]).map((preset) => (
              <button
                key={preset}
                className={`chip-categoria ${config.regras.preset === preset ? 'ativo' : ''}`}
                onClick={() => atualizar({ regras: REGRAS_PRESET[preset] })}
                aria-pressed={config.regras.preset === preset}
              >
                <span className="icone" aria-hidden="true">
                  {preset === 'classico' ? '🎩' : preset === 'radical' ? '🔥' : '🪜'}
                </span>
                <span>
                  <strong style={{ textTransform: 'capitalize' }}>{preset}</strong>
                  <span className="cinza pequeno" style={{ display: 'block', fontWeight: 400 }}>
                    {DESCRICAO_PRESET[preset]}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="linha" style={{ marginTop: 16 }}>
            <div className="campo" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label htmlFor="pulos">Pulos disponíveis: {config.regras.pulos}</label>
              <input
                id="pulos"
                type="range"
                min={0}
                max={5}
                value={config.regras.pulos}
                onChange={(e) => atualizar({ regras: { ...config.regras, pulos: Number(e.target.value) } })}
              />
            </div>
            <div className="campo" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label htmlFor="tempo">
                Tempo por pergunta: {config.regras.tempoPorPergunta === 0 ? 'sem limite' : `${config.regras.tempoPorPergunta}s`}
              </label>
              <input
                id="tempo"
                type="range"
                min={0}
                max={120}
                step={5}
                value={config.regras.tempoPorPergunta}
                onChange={(e) =>
                  atualizar({ regras: { ...config.regras, tempoPorPergunta: Number(e.target.value) } })
                }
              />
            </div>
          </div>
        </div>

        <div className="painel" style={{ marginBottom: 18 }}>
          <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Som e apresentação</h3>
          <div className="linha" style={{ gap: 18 }}>
            <label className="linha" style={{ gap: 8 }}>
              <input
                type="checkbox"
                checked={config.som}
                onChange={(e) => {
                  atualizar({ som: e.target.checked });
                  if (e.target.checked) som.clique();
                }}
              />
              Efeitos sonoros
            </label>
            <label className="linha" style={{ gap: 8 }}>
              <input
                type="checkbox"
                checked={config.animacoes}
                onChange={(e) => atualizar({ animacoes: e.target.checked })}
              />
              Animações e suspense
            </label>
            <label className="linha" style={{ gap: 8 }}>
              <input
                type="checkbox"
                checked={config.mostrarExplicacao}
                onChange={(e) => atualizar({ mostrarExplicacao: e.target.checked })}
              />
              Mostrar curiosidade após responder
            </label>
          </div>
          <div className="campo" style={{ maxWidth: 280, marginTop: 14, marginBottom: 0 }}>
            <label htmlFor="volume">Volume: {Math.round(config.volume * 100)}%</label>
            <input
              id="volume"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={config.volume}
              onChange={(e) => atualizar({ volume: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="painel">
          <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Perfil e dados</h3>
          <div className="campo" style={{ maxWidth: 320 }}>
            <label htmlFor="nome-perfil">Nome do participante</label>
            <input
              id="nome-perfil"
              value={perfil?.nome ?? ''}
              maxLength={24}
              onChange={(e) => definirPerfil(e.target.value, perfil?.avatar ?? '🙂')}
            />
          </div>
          <div className="linha">
            <button
              className="botao botao-fantasma botao-pequeno"
              onClick={() => {
                armazenamento.limparVistas();
                recarregar();
              }}
            >
              Liberar perguntas já vistas
            </button>
            <button
              className="botao botao-perigo botao-pequeno"
              onClick={() => {
                armazenamento.limparHistorico();
                armazenamento.limparEstatisticas();
                armazenamento.limparVistas();
                recarregar();
              }}
            >
              Apagar histórico e estatísticas
            </button>
          </div>
          <p className="cinza pequeno">
            Tudo é salvo apenas neste navegador (localStorage). Nada é enviado para servidores.
          </p>
        </div>
      </div>
    </>
  );
}
