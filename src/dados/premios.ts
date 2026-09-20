import type { Nivel } from '../tipos';

/** Escada de prêmios do Show do Milhão (16 perguntas). */
export const PREMIOS: number[] = [
  1_000, 2_000, 3_000, 4_000, 5_000, 10_000, 20_000, 30_000, 40_000, 50_000,
  100_000, 200_000, 300_000, 400_000, 500_000, 1_000_000,
];

export const TOTAL_PERGUNTAS = PREMIOS.length;

/** Dificuldade de cada pergunta da escada (índice 0-based). */
export function nivelDaPergunta(indice: number): Nivel {
  if (indice < 3) return 1;
  if (indice < 6) return 2;
  if (indice < 9) return 3;
  if (indice < 13) return 4;
  return 5;
}

/** Quantas perguntas de cada nível uma partida clássica usa. */
export const DISTRIBUICAO_NIVEIS: Record<Nivel, number> = {
  1: 3,
  2: 3,
  3: 3,
  4: 4,
  5: 3,
};

export function premioDaPergunta(indice: number): number {
  return PREMIOS[indice] ?? 0;
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/** Versão curta usada na escada lateral: "R$ 1 MILHÃO", "R$ 500 MIL". */
export function formatarPremioCurto(valor: number): string {
  if (valor >= 1_000_000) return 'R$ 1 MILHÃO';
  if (valor >= 1_000) return `R$ ${valor / 1000} MIL`;
  return formatarReais(valor);
}
