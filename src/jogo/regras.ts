import type { PresetRegra, Regras } from '../tipos';

export const REGRAS_PRESET: Record<PresetRegra, Regras> = {
  classico: {
    preset: 'classico',
    pulos: 3,
    tempoPorPergunta: 45,
    tempoCrescente: true,
    fracaoAoErrar: 0.5,
    patamares: [],
    valorPararNoMilhao: 500_000,
  },
  radical: {
    preset: 'radical',
    pulos: 3,
    tempoPorPergunta: 30,
    tempoCrescente: false,
    fracaoAoErrar: 0,
    patamares: [],
    valorPararNoMilhao: 500_000,
  },
  patamares: {
    preset: 'patamares',
    pulos: 3,
    tempoPorPergunta: 60,
    tempoCrescente: true,
    fracaoAoErrar: 0,
    patamares: [5, 10],
    valorPararNoMilhao: 500_000,
  },
};

export const REGRAS_PADRAO: Regras = REGRAS_PRESET.classico;

export const DESCRICAO_PRESET: Record<PresetRegra, string> = {
  classico: 'Ao errar, você leva metade do que acumulou. 45 segundos por pergunta, com mais tempo nas mais valiosas.',
  radical: 'Ao errar, você sai sem nada. 30 segundos por pergunta, sem tempo extra.',
  patamares: 'Patamares garantidos em R$ 5 mil e R$ 50 mil. Um minuto por pergunta, com mais tempo nas mais valiosas.',
};

/**
 * Tempo disponível para responder a pergunta de um degrau da escada.
 * Com `tempoCrescente`, quem chega às perguntas caras ganha mais tempo para pensar:
 * o tempo-base vale até a 5ª pergunta, aumenta 50% até a 10ª e dobra da 11ª em diante.
 */
export function tempoDaPergunta(regras: Regras, indice: number): number {
  if (regras.tempoPorPergunta <= 0) return 0;
  if (!regras.tempoCrescente) return regras.tempoPorPergunta;
  if (indice < 5) return regras.tempoPorPergunta;
  if (indice < 10) return Math.round(regras.tempoPorPergunta * 1.5);
  return regras.tempoPorPergunta * 2;
}
