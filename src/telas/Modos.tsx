import { useState } from 'react';
import { useLoja } from '../estado/loja';
import { Cabecalho } from '../componentes/Cabecalho';
import { SeletorCategorias } from '../componentes/SeletorCategorias';
import { contarPorCategoria } from '../dados/perguntas';
import type { CategoriaId } from '../tipos';

type ModoSelecionavel = 'treino' | 'contra-relogio' | 'sobrevivencia' | 'duelo';

const DESCRICOES: Record<ModoSelecionavel, { icone: string; nome: string; texto: string }> = {
  treino: {
    icone: '🎯',
    nome: 'Treino',
    texto: '20 perguntas das categorias escolhidas, sem prêmio e sem cronômetro. Ideal para estudar.',
  },
  'contra-relogio': {
    icone: '⏱️',
    nome: 'Contra-relógio',
    texto: '20 perguntas com 20 segundos cada. Responder rápido vale pontos extras.',
  },
  sobrevivencia: {
    icone: '❤️',
    nome: 'Sobrevivência',
    texto: 'Três vidas, dificuldade crescente e 30 segundos por pergunta. Até onde você chega?',
  },
  duelo: {
    icone: '⚔️',
    nome: 'Duelo (2 jogadores)',
    texto: 'Dois participantes no mesmo aparelho, revezando 12 perguntas. Ganha quem fizer mais pontos.',
  },
};

export function Modos() {
  const iniciarTreino = useLoja((e) => e.iniciarTreino);
  const iniciarContraRelogio = useLoja((e) => e.iniciarContraRelogio);
  const iniciarSobrevivencia = useLoja((e) => e.iniciarSobrevivencia);
  const iniciarDuelo = useLoja((e) => e.iniciarDuelo);

  const [modo, setModo] = useState<ModoSelecionavel>('treino');
  const [categorias, setCategorias] = useState<CategoriaId[]>([]);
  const [nomeA, setNomeA] = useState('Jogador 1');
  const [nomeB, setNomeB] = useState('Jogador 2');
  const contagem = contarPorCategoria();

  function alternar(id: CategoriaId) {
    setCategorias((atual) =>
      atual.includes(id) ? atual.filter((c) => c !== id) : [...atual, id],
    );
  }

  function comecar() {
    if (modo === 'treino') iniciarTreino(categorias);
    else if (modo === 'contra-relogio') iniciarContraRelogio(categorias);
    else if (modo === 'sobrevivencia') iniciarSobrevivencia(categorias);
    else iniciarDuelo(nomeA, nomeB, categorias);
  }

  return (
    <>
      <Cabecalho titulo="Outros modos de jogo" />
      <div className="conteudo">
        <div className="cartoes-menu" style={{ marginBottom: 22 }}>
          {(Object.keys(DESCRICOES) as ModoSelecionavel[]).map((chave) => (
            <button
              key={chave}
              className="cartao-menu"
              style={
                modo === chave
                  ? { borderColor: 'var(--ouro-400)', background: 'linear-gradient(180deg, rgba(242,193,78,0.16), rgba(3,6,29,0.85))' }
                  : undefined
              }
              onClick={() => setModo(chave)}
              aria-pressed={modo === chave}
            >
              <span className="icone" aria-hidden="true">{DESCRICOES[chave].icone}</span>
              <span className="titulo texto-ouro">{DESCRICOES[chave].nome}</span>
              <span className="descricao">{DESCRICOES[chave].texto}</span>
            </button>
          ))}
        </div>

        {modo === 'duelo' && (
          <div className="painel" style={{ marginBottom: 18 }}>
            <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Quem vai duelar?</h3>
            <div className="linha">
              <div className="campo" style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="jogador-a">Jogador 1</label>
                <input id="jogador-a" value={nomeA} maxLength={18} onChange={(e) => setNomeA(e.target.value)} />
              </div>
              <div className="campo" style={{ flex: 1, minWidth: 180 }}>
                <label htmlFor="jogador-b">Jogador 2</label>
                <input id="jogador-b" value={nomeB} maxLength={18} onChange={(e) => setNomeB(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="painel">
          <h3 className="texto-ouro" style={{ fontSize: '1rem' }}>Categorias</h3>
          <SeletorCategorias
            selecionadas={categorias}
            onAlternar={alternar}
            onTodas={() => setCategorias([])}
            contagem={contagem}
          />
        </div>

        <div className="centro" style={{ marginTop: 22 }}>
          <button className="botao botao-ouro botao-grande" onClick={comecar}>
            ▶ Começar {DESCRICOES[modo].nome.toLowerCase()}
          </button>
        </div>
      </div>
    </>
  );
}
