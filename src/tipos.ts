/** Tipos centrais do Show do Milhão. */

export type CategoriaId =
  | 'historia-brasil'
  | 'historia-geral'
  | 'geografia-brasil'
  | 'geografia-mundial'
  | 'biologia-corpo'
  | 'fisica-quimica'
  | 'matematica-logica'
  | 'lingua-portuguesa'
  | 'literatura'
  | 'musica'
  | 'cinema-tv'
  | 'futebol'
  | 'esportes'
  | 'tecnologia'
  | 'arte-mitologia'
  | 'curiosidades';

export type Nivel = 1 | 2 | 3 | 4 | 5;

/** Índice da alternativa correta: 0=A, 1=B, 2=C, 3=D. */
export type IndiceAlternativa = 0 | 1 | 2 | 3;

export interface Categoria {
  id: CategoriaId;
  nome: string;
  nomeCurto: string;
  icone: string;
  cor: string;
  descricao: string;
}

export interface Pergunta {
  id: string;
  categoria: CategoriaId;
  nivel: Nivel;
  enunciado: string;
  alternativas: [string, string, string, string];
  correta: IndiceAlternativa;
  explicacao: string;
  tags?: string[];
}

/** Pergunta criada pelo usuário no editor; mesma forma, marcada como customizada. */
export interface PerguntaCustomizada extends Pergunta {
  customizada: true;
  criadaEm: number;
}

// ---------------------------------------------------------------- Ajudas

export type TipoAjuda = 'cartas' | 'universitarios' | 'placas' | 'pular';

export interface OpiniaoUniversitario {
  nome: string;
  curso: string;
  escolha: IndiceAlternativa;
  confianca: 'certeza' | 'acho' | 'chute';
  fala: string;
}

export interface ResultadoCartas {
  tipo: 'cartas';
  eliminadas: IndiceAlternativa[];
}

export interface ResultadoUniversitarios {
  tipo: 'universitarios';
  opinioes: OpiniaoUniversitario[];
  consenso: IndiceAlternativa | null;
}

export interface ResultadoPlacas {
  tipo: 'placas';
  percentuais: [number, number, number, number];
}

export type ResultadoAjuda = ResultadoCartas | ResultadoUniversitarios | ResultadoPlacas;

// ---------------------------------------------------------------- Regras

export type PresetRegra = 'classico' | 'radical' | 'patamares';

export interface Regras {
  preset: PresetRegra;
  /** Quantos pulos o participante tem na partida. */
  pulos: number;
  /** Tempo por pergunta em segundos; 0 = sem cronômetro. */
  tempoPorPergunta: number;
  /** Fração do acumulado que o participante leva ao errar (preset clássico). */
  fracaoAoErrar: number;
  /** Índices (1-based) das perguntas que são patamares garantidos. */
  patamares: number[];
  /** Valor garantido ao parar na pergunta do milhão. */
  valorPararNoMilhao: number;
}

// ---------------------------------------------------------------- Partida

export type FasePartida =
  | 'sorteando'
  | 'respondendo'
  | 'suspense'
  | 'revelado'
  | 'encerrada';

export type MotivoFim = 'acertou-milhao' | 'errou' | 'parou' | 'tempo';

export type ModoJogo =
  | 'classico'
  | 'treino'
  | 'contra-relogio'
  | 'sobrevivencia'
  | 'duelo';

export interface RespostaRegistrada {
  perguntaId: string;
  enunciado: string;
  categoria: CategoriaId;
  nivel: Nivel;
  escolha: IndiceAlternativa | null;
  correta: IndiceAlternativa;
  acertou: boolean;
  pulada: boolean;
  ajudasUsadas: TipoAjuda[];
  segundos: number;
}

export interface EstadoPartida {
  modo: ModoJogo;
  semente: number;
  regras: Regras;
  perguntas: Pergunta[];
  indice: number;
  fase: FasePartida;
  escolha: IndiceAlternativa | null;
  eliminadas: IndiceAlternativa[];
  ajudasDisponiveis: Record<TipoAjuda, number>;
  ajudaAtiva: ResultadoAjuda | null;
  ajudasNaPergunta: TipoAjuda[];
  historico: RespostaRegistrada[];
  acumulado: number;
  premioFinal: number;
  motivoFim: MotivoFim | null;
  tempoRestante: number;
  vidas: number;
  pontos: number;
}

// ---------------------------------------------------------------- Persistência

export interface Perfil {
  nome: string;
  avatar: string;
  criadoEm: number;
}

export interface RegistroHistorico {
  id: string;
  data: number;
  jogador: string;
  avatar: string;
  modo: ModoJogo;
  acertos: number;
  perguntasRespondidas: number;
  premio: number;
  pontos: number;
  motivoFim: MotivoFim | null;
  nivelAlcancado: number;
}

export interface EstatisticaCategoria {
  acertos: number;
  erros: number;
}

export interface Configuracoes {
  som: boolean;
  volume: number;
  animacoes: boolean;
  regras: Regras;
  mostrarExplicacao: boolean;
}
