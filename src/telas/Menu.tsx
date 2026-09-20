import { useState } from 'react';
import { useLoja, type Tela } from '../estado/loja';
import { Logo } from '../componentes/Logo';
import { TOTAL_NO_BANCO } from '../dados/perguntas';
import { CATEGORIAS } from '../dados/categorias';
import { formatarReais } from '../dados/premios';
import { som } from '../audio/sintetizador';

const AVATARES = ['🙂', '😎', '🤓', '🦊', '🐯', '🦁', '🐼', '🦉', '🚀', '⭐', '🎩', '👑'];

const OPCOES: { tela: Tela; icone: string; titulo: string; descricao: string }[] = [
  {
    tela: 'modos',
    icone: '🎮',
    titulo: 'Outros modos',
    descricao: 'Treino por categoria, contra-relógio, sobrevivência e duelo de dois jogadores.',
  },
  {
    tela: 'ranking',
    icone: '🏆',
    titulo: 'Hall da Fama',
    descricao: 'Suas melhores partidas, prêmios conquistados e histórico completo.',
  },
  {
    tela: 'estatisticas',
    icone: '📊',
    titulo: 'Estatísticas',
    descricao: 'Aproveitamento por categoria para descobrir seus pontos fracos.',
  },
  {
    tela: 'acervo',
    icone: '📚',
    titulo: 'Acervo de perguntas',
    descricao: 'Navegue, busque e estude todas as perguntas do banco.',
  },
  {
    tela: 'editor',
    icone: '✏️',
    titulo: 'Editor de perguntas',
    descricao: 'Crie suas próprias perguntas e jogue com elas.',
  },
  {
    tela: 'config',
    icone: '⚙️',
    titulo: 'Configurações',
    descricao: 'Regras da partida, som, animações e dados salvos.',
  },
  {
    tela: 'regulamento',
    icone: '📜',
    titulo: 'Regulamento',
    descricao: 'Como funciona a escada de prêmios, as ajudas e cada modo de jogo.',
  },
];

export function Menu() {
  const perfil = useLoja((e) => e.perfil);
  const definirPerfil = useLoja((e) => e.definirPerfil);
  const irPara = useLoja((e) => e.irPara);
  const iniciarClassico = useLoja((e) => e.iniciarClassico);
  const config = useLoja((e) => e.config);
  const customizadas = useLoja((e) => e.customizadas);

  const [nome, setNome] = useState(perfil?.nome ?? '');
  const [avatar, setAvatar] = useState(perfil?.avatar ?? '🙂');

  const total = TOTAL_NO_BANCO + customizadas.length;

  if (!perfil) {
    return (
      <div className="conteudo">
        <Logo />
        <div className="painel painel-ouro" style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 className="texto-ouro centro">Quem vai tentar o milhão?</h2>
          <div className="campo">
            <label htmlFor="nome">Seu nome</label>
            <input
              id="nome"
              value={nome}
              maxLength={24}
              placeholder="Ex.: Maria de Sousa"
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && nome.trim() && definirPerfil(nome, avatar)}
              autoFocus
            />
          </div>
          <div className="campo">
            <label>Escolha um avatar</label>
            <div className="linha">
              {AVATARES.map((emoji) => (
                <button
                  key={emoji}
                  className={`botao botao-pequeno ${avatar === emoji ? 'botao-ouro' : 'botao-fantasma'}`}
                  onClick={() => setAvatar(emoji)}
                  aria-pressed={avatar === emoji}
                  aria-label={`Avatar ${emoji}`}
                >
                  <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                </button>
              ))}
            </div>
          </div>
          <button
            className="botao botao-ouro botao-grande"
            style={{ width: '100%' }}
            disabled={!nome.trim()}
            onClick={() => definirPerfil(nome, avatar)}
          >
            Entrar no palco
          </button>
          <p className="cinza pequeno centro" style={{ marginTop: 12 }}>
            {total.toLocaleString('pt-BR')} perguntas esperando por você.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="conteudo">
      <Logo />
      <p className="centro cinza" style={{ marginTop: -6 }}>
        Olá, <strong>{perfil.avatar} {perfil.nome}</strong>! São 16 perguntas entre você e{' '}
        <strong className="texto-ouro">{formatarReais(1_000_000)}</strong>.
      </p>

      <div className="centro" style={{ margin: '22px 0 28px' }}>
        <button
          className="botao botao-ouro botao-grande"
          style={{ fontSize: '1.25rem', padding: '20px 44px' }}
          onClick={() => {
            if (config.som) som.clique();
            iniciarClassico();
          }}
        >
          ▶ Jogar o Show do Milhão
        </button>
        <p className="cinza pequeno" style={{ marginTop: 10 }}>
          Regra atual: <strong>{config.regras.preset}</strong> · {CATEGORIAS.length} categorias ·{' '}
          {total.toLocaleString('pt-BR')} perguntas
        </p>
      </div>

      <div className="cartoes-menu">
        {OPCOES.map((opcao) => (
          <button key={opcao.tela} className="cartao-menu" onClick={() => irPara(opcao.tela)}>
            <span className="icone" aria-hidden="true">{opcao.icone}</span>
            <span className="titulo texto-ouro">{opcao.titulo}</span>
            <span className="descricao">{opcao.descricao}</span>
          </button>
        ))}
      </div>

      <p className="centro cinza pequeno" style={{ marginTop: 30 }}>
        Projeto de fã, sem vínculo com o programa original. Todo o áudio é sintetizado e as perguntas são autorais.
      </p>
    </div>
  );
}
