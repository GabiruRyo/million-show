/** Gerador pseudoaleatório determinístico (mulberry32) para partidas reproduzíveis. */
export type Rng = () => number;

export function criarRng(semente: number): Rng {
  let a = semente >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sementeAleatoria(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

export function inteiro(rng: Rng, minimo: number, maximo: number): number {
  return minimo + Math.floor(rng() * (maximo - minimo + 1));
}

export function escolher<T>(rng: Rng, lista: readonly T[]): T {
  return lista[Math.floor(rng() * lista.length)];
}

/** Fisher-Yates determinístico; devolve uma cópia embaralhada. */
export function embaralhar<T>(rng: Rng, lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
