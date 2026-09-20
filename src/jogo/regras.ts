import type { PresetRegra, Regras } from '../tipos';

export const REGRAS_PRESET: Record<PresetRegra, Regras> = {
  classico: {
    preset: 'classico',
    pulos: 3,
    tempoPorPergunta: 0,
    fracaoAoErrar: 0.5,
    patamares: [],
    valorPararNoMilhao: 500_000,
  },
  radical: {
    preset: 'radical',
    pulos: 3,
    tempoPorPergunta: 45,
    fracaoAoErrar: 0,
    patamares: [],
    valorPararNoMilhao: 500_000,
  },
  patamares: {
    preset: 'patamares',
    pulos: 3,
    tempoPorPergunta: 0,
    fracaoAoErrar: 0,
    patamares: [5, 10],
    valorPararNoMilhao: 500_000,
  },
};

export const REGRAS_PADRAO: Regras = REGRAS_PRESET.classico;

export const DESCRICAO_PRESET: Record<PresetRegra, string> = {
  classico: 'Ao errar, você leva metade do que acumulou. Sem cronômetro.',
  radical: 'Ao errar, você sai sem nada. 45 segundos por pergunta.',
  patamares: 'Patamares garantidos em R$ 5 mil e R$ 50 mil, como nos programas modernos.',
};
