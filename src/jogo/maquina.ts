import type {
  EstadoPartida,
  IndiceAlternativa,
  ModoJogo,
  MotivoFim,
  Pergunta,
  Regras,
  RespostaRegistrada,
  TipoAjuda,
} from '../tipos';
import { PREMIOS, TOTAL_PERGUNTAS } from '../dados/premios';
import { REGRAS_PADRAO } from './regras';
import { usarCartas, usarPlacas, usarUniversitarios } from './ajudas';

export interface OpcoesPartida {
  modo: ModoJogo;
  perguntas: Pergunta[];
  semente: number;
  regras?: Regras;
  vidas?: number;
}

export function criarPartida(opcoes: OpcoesPartida): EstadoPartida {
  const regras = opcoes.regras ?? REGRAS_PADRAO;
  return {
    modo: opcoes.modo,
    semente: opcoes.semente,
    regras,
    perguntas: opcoes.perguntas,
    indice: 0,
    fase: 'respondendo',
    escolha: null,
    eliminadas: [],
    ajudasDisponiveis: {
      pular: opcoes.modo === 'classico' ? regras.pulos : 0,
      cartas: opcoes.modo === 'classico' ? 1 : 0,
      universitarios: opcoes.modo === 'classico' ? 1 : 0,
      placas: opcoes.modo === 'classico' ? 1 : 0,
    },
    ajudaAtiva: null,
    ajudasNaPergunta: [],
    historico: [],
    acumulado: 0,
    premioFinal: 0,
    motivoFim: null,
    tempoRestante: regras.tempoPorPergunta,
    vidas: opcoes.vidas ?? (opcoes.modo === 'sobrevivencia' ? 3 : 0),
    pontos: 0,
  };
}

export function perguntaAtual(estado: EstadoPartida): Pergunta | undefined {
  return estado.perguntas[estado.indice];
}

export function ehPerguntaDoMilhao(estado: EstadoPartida): boolean {
  return estado.modo === 'classico' && estado.indice === TOTAL_PERGUNTAS - 1;
}

/** Valor acumulado após acertar a pergunta de índice informado. */
export function acumuladoApos(indice: number): number {
  return PREMIOS[indice] ?? 0;
}

/** Maior patamar garantido já ultrapassado (em valor). */
function patamarGarantido(estado: EstadoPartida): number {
  let valor = 0;
  for (const patamar of estado.regras.patamares) {
    if (estado.historico.filter((r) => r.acertou).length >= patamar) {
      valor = Math.max(valor, PREMIOS[patamar - 1] ?? 0);
    }
  }
  return valor;
}

export function calcularPremio(estado: EstadoPartida, motivo: MotivoFim): number {
  if (estado.modo !== 'classico') return 0;
  switch (motivo) {
    case 'acertou-milhao':
      return PREMIOS[TOTAL_PERGUNTAS - 1];
    case 'parou':
      return ehPerguntaDoMilhao(estado)
        ? Math.max(estado.acumulado, estado.regras.valorPararNoMilhao)
        : estado.acumulado;
    case 'errou':
    case 'tempo': {
      if (ehPerguntaDoMilhao(estado)) return 0;
      const porPatamar = patamarGarantido(estado);
      const porFracao = Math.floor(estado.acumulado * estado.regras.fracaoAoErrar);
      return Math.max(porPatamar, porFracao);
    }
    default:
      return 0;
  }
}

export function selecionar(estado: EstadoPartida, escolha: IndiceAlternativa): EstadoPartida {
  if (estado.fase !== 'respondendo' || estado.eliminadas.includes(escolha)) return estado;
  return { ...estado, escolha };
}

/** Confirma a resposta e entra no suspense (a revelação vem depois, com animação). */
export function confirmar(estado: EstadoPartida): EstadoPartida {
  if (estado.fase !== 'respondendo' || estado.escolha === null) return estado;
  return { ...estado, fase: 'suspense' };
}

function registrar(
  estado: EstadoPartida,
  pergunta: Pergunta,
  escolha: IndiceAlternativa | null,
  acertou: boolean,
  pulada: boolean,
): RespostaRegistrada {
  return {
    perguntaId: pergunta.id,
    enunciado: pergunta.enunciado,
    categoria: pergunta.categoria,
    nivel: pergunta.nivel,
    escolha,
    correta: pergunta.correta,
    acertou,
    pulada,
    ajudasUsadas: estado.ajudasNaPergunta,
    segundos: Math.max(0, estado.regras.tempoPorPergunta - estado.tempoRestante),
  };
}

function pontosDaResposta(estado: EstadoPartida, pergunta: Pergunta): number {
  const base = pergunta.nivel * 100;
  const bonusTempo =
    estado.regras.tempoPorPergunta > 0
      ? Math.round((estado.tempoRestante / estado.regras.tempoPorPergunta) * 50)
      : 0;
  const semAjuda = estado.ajudasNaPergunta.length === 0 ? 25 : 0;
  return base + bonusTempo + semAjuda;
}

/** Revela o resultado da resposta confirmada. */
export function revelar(estado: EstadoPartida): EstadoPartida {
  const pergunta = perguntaAtual(estado);
  if (!pergunta || estado.escolha === null) return estado;

  const acertou = estado.escolha === pergunta.correta;
  const historico = [...estado.historico, registrar(estado, pergunta, estado.escolha, acertou, false)];
  const acumulado = acertou && estado.modo === 'classico' ? acumuladoApos(estado.indice) : estado.acumulado;
  const pontos = acertou ? estado.pontos + pontosDaResposta(estado, pergunta) : estado.pontos;
  const vidas = acertou ? estado.vidas : estado.vidas - 1;

  const base: EstadoPartida = { ...estado, fase: 'revelado', historico, acumulado, pontos, vidas };

  if (acertou && ehPerguntaDoMilhao(estado)) {
    return { ...base, fase: 'encerrada', motivoFim: 'acertou-milhao', premioFinal: PREMIOS[15] };
  }
  if (!acertou) {
    if (estado.modo === 'sobrevivencia' && vidas > 0) return base;
    const motivo: MotivoFim = 'errou';
    return { ...base, motivoFim: motivo, premioFinal: calcularPremio(base, motivo) };
  }
  return base;
}

/** Avança para a próxima pergunta (ou encerra se a fila acabou). */
export function proxima(estado: EstadoPartida): EstadoPartida {
  if (estado.motivoFim) return { ...estado, fase: 'encerrada' };
  const proximoIndice = estado.indice + 1;
  if (proximoIndice >= estado.perguntas.length) {
    const motivo: MotivoFim = estado.modo === 'classico' ? 'acertou-milhao' : 'parou';
    return {
      ...estado,
      fase: 'encerrada',
      motivoFim: motivo,
      premioFinal: calcularPremio(estado, motivo),
    };
  }
  return {
    ...estado,
    indice: proximoIndice,
    fase: 'respondendo',
    escolha: null,
    eliminadas: [],
    ajudaAtiva: null,
    ajudasNaPergunta: [],
    tempoRestante: estado.regras.tempoPorPergunta,
  };
}

/** Pula a pergunta atual sem penalidade, consumindo um pulo. */
export function pular(estado: EstadoPartida): EstadoPartida {
  const pergunta = perguntaAtual(estado);
  if (!pergunta || estado.fase !== 'respondendo' || estado.ajudasDisponiveis.pular <= 0) return estado;
  const comRegistro: EstadoPartida = {
    ...estado,
    historico: [...estado.historico, registrar(estado, pergunta, null, false, true)],
    ajudasDisponiveis: { ...estado.ajudasDisponiveis, pular: estado.ajudasDisponiveis.pular - 1 },
  };
  return proxima(comRegistro);
}

export function usarAjuda(estado: EstadoPartida, tipo: TipoAjuda): EstadoPartida {
  const pergunta = perguntaAtual(estado);
  if (!pergunta || estado.fase !== 'respondendo') return estado;
  if (tipo === 'pular') return pular(estado);
  if (estado.ajudasDisponiveis[tipo] <= 0) return estado;

  const semente = estado.semente + estado.indice * 977 + tipo.length * 31;
  const disponiveis = { ...estado.ajudasDisponiveis, [tipo]: estado.ajudasDisponiveis[tipo] - 1 };
  const ajudasNaPergunta = [...estado.ajudasNaPergunta, tipo];

  if (tipo === 'cartas') {
    const resultado = usarCartas(pergunta, semente);
    const escolha =
      estado.escolha !== null && resultado.eliminadas.includes(estado.escolha) ? null : estado.escolha;
    return {
      ...estado,
      ajudasDisponiveis: disponiveis,
      ajudasNaPergunta,
      eliminadas: resultado.eliminadas,
      ajudaAtiva: resultado,
      escolha,
    };
  }
  if (tipo === 'universitarios') {
    return {
      ...estado,
      ajudasDisponiveis: disponiveis,
      ajudasNaPergunta,
      ajudaAtiva: usarUniversitarios(pergunta, semente, estado.eliminadas),
    };
  }
  return {
    ...estado,
    ajudasDisponiveis: disponiveis,
    ajudasNaPergunta,
    ajudaAtiva: usarPlacas(pergunta, semente, estado.eliminadas),
  };
}

export function fecharAjuda(estado: EstadoPartida): EstadoPartida {
  return { ...estado, ajudaAtiva: null };
}

export function parar(estado: EstadoPartida): EstadoPartida {
  if (estado.fase === 'encerrada') return estado;
  const motivo: MotivoFim = 'parou';
  return {
    ...estado,
    fase: 'encerrada',
    motivoFim: motivo,
    premioFinal: calcularPremio(estado, motivo),
  };
}

/** Tique do cronômetro; ao zerar, encerra a partida por tempo. */
export function tique(estado: EstadoPartida): EstadoPartida {
  if (estado.fase !== 'respondendo' || estado.regras.tempoPorPergunta === 0) return estado;
  const tempoRestante = estado.tempoRestante - 1;
  if (tempoRestante > 0) return { ...estado, tempoRestante };

  const pergunta = perguntaAtual(estado);
  const historico = pergunta
    ? [...estado.historico, registrar(estado, pergunta, null, false, false)]
    : estado.historico;
  const vidas = estado.vidas - 1;
  const base: EstadoPartida = { ...estado, tempoRestante: 0, historico, vidas, fase: 'revelado' };
  if (estado.modo === 'sobrevivencia' && vidas > 0) return base;
  const motivo: MotivoFim = 'tempo';
  return { ...base, motivoFim: motivo, premioFinal: calcularPremio(base, motivo) };
}

export function acertos(estado: EstadoPartida): number {
  return estado.historico.filter((r) => r.acertou).length;
}
