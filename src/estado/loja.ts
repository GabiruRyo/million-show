import { useMemo } from 'react';
import { create } from 'zustand';
import type {
  CategoriaId,
  Configuracoes,
  EstadoPartida,
  IndiceAlternativa,
  ModoJogo,
  Perfil,
  Pergunta,
  PerguntaCustomizada,
  RegistroHistorico,
  TipoAjuda,
} from '../tipos';
import { BANCO_PERGUNTAS } from '../dados/perguntas';
import { sortearFila, sortearPartida } from '../jogo/sorteio';
import { sementeAleatoria } from '../jogo/aleatorio';
import {
  acertos,
  confirmar,
  criarPartida,
  fecharAjuda,
  parar,
  proxima,
  revelar,
  selecionar,
  tique,
  usarAjuda,
} from '../jogo/maquina';
import { armazenamento, CONFIG_PADRAO } from '../armazenamento/local';

export type Tela =
  | 'menu'
  | 'modos'
  | 'partida'
  | 'fim'
  | 'ranking'
  | 'estatisticas'
  | 'acervo'
  | 'editor'
  | 'config'
  | 'regulamento'
  | 'duelo';

export interface EstadoDuelo {
  nomes: [string, string];
  pontos: [number, number];
  acertos: [number, number];
  vez: 0 | 1;
  perguntas: Pergunta[];
  indice: number;
  escolha: IndiceAlternativa | null;
  fase: 'respondendo' | 'revelado' | 'encerrada';
}

interface Loja {
  tela: Tela;
  perfil: Perfil | null;
  config: Configuracoes;
  partida: EstadoPartida | null;
  duelo: EstadoDuelo | null;
  customizadas: PerguntaCustomizada[];
  historico: RegistroHistorico[];

  banco: () => Pergunta[];
  irPara: (tela: Tela) => void;
  definirPerfil: (nome: string, avatar: string) => void;
  atualizarConfig: (parcial: Partial<Configuracoes>) => void;

  iniciarClassico: () => void;
  iniciarTreino: (categorias: CategoriaId[]) => void;
  iniciarContraRelogio: (categorias: CategoriaId[]) => void;
  iniciarSobrevivencia: (categorias: CategoriaId[]) => void;
  iniciarDuelo: (nomeA: string, nomeB: string, categorias: CategoriaId[]) => void;

  escolher: (indice: IndiceAlternativa) => void;
  confirmarResposta: () => void;
  revelarResposta: () => void;
  avancar: () => void;
  acionarAjuda: (tipo: TipoAjuda) => void;
  dispensarAjuda: () => void;
  pararAgora: () => void;
  tiqueCronometro: () => void;
  encerrarEsalvar: () => void;

  duelorEscolher: (indice: IndiceAlternativa) => void;
  duelorRevelar: () => void;
  duelorAvancar: () => void;

  salvarCustomizada: (pergunta: PerguntaCustomizada) => void;
  removerCustomizada: (id: string) => void;
  recarregarDados: () => void;
}

const PERGUNTAS_MODO_LIVRE = 20;

export const useLoja = create<Loja>((set, get) => ({
  tela: 'menu',
  perfil: typeof localStorage === 'undefined' ? null : armazenamento.lerPerfil(),
  config: typeof localStorage === 'undefined' ? CONFIG_PADRAO : armazenamento.lerConfig(),
  partida: null,
  duelo: null,
  customizadas: typeof localStorage === 'undefined' ? [] : armazenamento.lerCustomizadas(),
  historico: typeof localStorage === 'undefined' ? [] : armazenamento.lerHistorico(),

  banco: () => [...BANCO_PERGUNTAS, ...get().customizadas],

  irPara: (tela) => set({ tela }),

  definirPerfil: (nome, avatar) => {
    const perfil: Perfil = { nome: nome.trim() || 'Participante', avatar, criadoEm: Date.now() };
    armazenamento.salvarPerfil(perfil);
    set({ perfil });
  },

  atualizarConfig: (parcial) => {
    const config = { ...get().config, ...parcial };
    armazenamento.salvarConfig(config);
    set({ config });
  },

  iniciarClassico: () => {
    const semente = sementeAleatoria();
    const evitar = new Set(armazenamento.lerVistas());
    const perguntas = sortearPartida(get().banco(), { semente, evitar });
    armazenamento.registrarVistas(perguntas.map((p) => p.id));
    set({
      partida: criarPartida({ modo: 'classico', perguntas, semente, regras: get().config.regras }),
      tela: 'partida',
    });
  },

  iniciarTreino: (categorias) => iniciarModoLivre(set, get, 'treino', categorias),
  iniciarContraRelogio: (categorias) => iniciarModoLivre(set, get, 'contra-relogio', categorias),
  iniciarSobrevivencia: (categorias) => iniciarModoLivre(set, get, 'sobrevivencia', categorias),

  iniciarDuelo: (nomeA, nomeB, categorias) => {
    const semente = sementeAleatoria();
    const perguntas = sortearFila(get().banco(), {
      semente,
      categorias,
      quantidade: 12,
      progressivo: true,
    });
    set({
      duelo: {
        nomes: [nomeA.trim() || 'Jogador 1', nomeB.trim() || 'Jogador 2'],
        pontos: [0, 0],
        acertos: [0, 0],
        vez: 0,
        perguntas,
        indice: 0,
        escolha: null,
        fase: 'respondendo',
      },
      tela: 'duelo',
    });
  },

  escolher: (indice) => {
    const partida = get().partida;
    if (partida) set({ partida: selecionar(partida, indice) });
  },
  confirmarResposta: () => {
    const partida = get().partida;
    if (partida) set({ partida: confirmar(partida) });
  },
  revelarResposta: () => {
    const partida = get().partida;
    if (partida) set({ partida: revelar(partida) });
  },
  avancar: () => {
    const partida = get().partida;
    if (!partida) return;
    const proximo = proxima(partida);
    set({ partida: proximo });
    if (proximo.fase === 'encerrada') get().encerrarEsalvar();
  },
  acionarAjuda: (tipo) => {
    const partida = get().partida;
    if (partida) set({ partida: usarAjuda(partida, tipo) });
  },
  dispensarAjuda: () => {
    const partida = get().partida;
    if (partida) set({ partida: fecharAjuda(partida) });
  },
  pararAgora: () => {
    const partida = get().partida;
    if (!partida) return;
    set({ partida: parar(partida) });
    get().encerrarEsalvar();
  },
  tiqueCronometro: () => {
    const partida = get().partida;
    if (!partida) return;
    const proximo = tique(partida);
    set({ partida: proximo });
    if (proximo.fase === 'encerrada') get().encerrarEsalvar();
  },

  encerrarEsalvar: () => {
    const partida = get().partida;
    const perfil = get().perfil;
    if (!partida || partida.motivoFim === null) return;

    const registro: RegistroHistorico = {
      id: `${Date.now()}-${partida.semente}`,
      data: Date.now(),
      jogador: perfil?.nome ?? 'Participante',
      avatar: perfil?.avatar ?? '🙂',
      modo: partida.modo,
      acertos: acertos(partida),
      perguntasRespondidas: partida.historico.filter((r) => !r.pulada).length,
      premio: partida.premioFinal,
      pontos: partida.pontos,
      motivoFim: partida.motivoFim,
      nivelAlcancado: partida.indice + 1,
    };
    const historico = armazenamento.adicionarHistorico(registro);
    armazenamento.registrarEstatisticas(
      partida.historico
        .filter((r) => !r.pulada)
        .map((r) => ({ categoria: r.categoria, acertou: r.acertou })),
    );
    set({ historico, tela: 'fim' });
  },

  duelorEscolher: (indice) => {
    const duelo = get().duelo;
    if (duelo && duelo.fase === 'respondendo') set({ duelo: { ...duelo, escolha: indice } });
  },
  duelorRevelar: () => {
    const duelo = get().duelo;
    if (!duelo || duelo.escolha === null) return;
    const pergunta = duelo.perguntas[duelo.indice];
    const acertou = duelo.escolha === pergunta.correta;
    const pontos: [number, number] = [...duelo.pontos] as [number, number];
    const acertosDuelo: [number, number] = [...duelo.acertos] as [number, number];
    if (acertou) {
      pontos[duelo.vez] += pergunta.nivel * 100;
      acertosDuelo[duelo.vez] += 1;
    }
    set({ duelo: { ...duelo, pontos, acertos: acertosDuelo, fase: 'revelado' } });
  },
  duelorAvancar: () => {
    const duelo = get().duelo;
    if (!duelo) return;
    const indice = duelo.indice + 1;
    if (indice >= duelo.perguntas.length) {
      set({ duelo: { ...duelo, fase: 'encerrada' } });
      return;
    }
    set({
      duelo: {
        ...duelo,
        indice,
        vez: duelo.vez === 0 ? 1 : 0,
        escolha: null,
        fase: 'respondendo',
      },
    });
  },

  salvarCustomizada: (pergunta) => {
    const lista = [...get().customizadas.filter((p) => p.id !== pergunta.id), pergunta];
    armazenamento.salvarCustomizadas(lista);
    set({ customizadas: lista });
  },
  removerCustomizada: (id) => {
    const lista = get().customizadas.filter((p) => p.id !== id);
    armazenamento.salvarCustomizadas(lista);
    set({ customizadas: lista });
  },
  recarregarDados: () => {
    set({
      historico: armazenamento.lerHistorico(),
      customizadas: armazenamento.lerCustomizadas(),
      config: armazenamento.lerConfig(),
      perfil: armazenamento.lerPerfil(),
    });
  },
}));

/**
 * Banco completo (oficial + perguntas do usuário) para uso em componentes.
 * Precisa ser memoizado: um seletor que devolve um array novo a cada render
 * faria o zustand disparar re-renderizações em loop.
 */
export function useBanco(): Pergunta[] {
  const customizadas = useLoja((e) => e.customizadas);
  return useMemo(
    () => (customizadas.length === 0 ? BANCO_PERGUNTAS : [...BANCO_PERGUNTAS, ...customizadas]),
    [customizadas],
  );
}

type Set = (parcial: Partial<Loja>) => void;
type Get = () => Loja;

function iniciarModoLivre(set: Set, get: Get, modo: ModoJogo, categorias: CategoriaId[]): void {
  const semente = sementeAleatoria();
  const quantidade = modo === 'sobrevivencia' ? 60 : PERGUNTAS_MODO_LIVRE;
  const perguntas = sortearFila(get().banco(), {
    semente,
    categorias,
    quantidade,
    progressivo: modo !== 'treino',
  });
  const regras = {
    ...get().config.regras,
    tempoPorPergunta: modo === 'contra-relogio' ? 20 : modo === 'sobrevivencia' ? 30 : 0,
  };
  set({
    partida: criarPartida({ modo, perguntas, semente, regras, vidas: modo === 'sobrevivencia' ? 3 : 1 }),
    tela: 'partida',
  });
}
