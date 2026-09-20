import type { CategoriaId, IndiceAlternativa, Nivel, Pergunta } from '../../tipos';

/** Formato compacto de autoria: enunciado, alternativas, índice da correta e explicação. */
export type Entrada = [
  enunciado: string,
  alternativas: [string, string, string, string],
  correta: IndiceAlternativa,
  explicacao: string,
];

/**
 * Monta as perguntas de uma categoria a partir das entradas de cada nível,
 * gerando ids no padrão `categoria-nivel-NN`.
 */
export function montar(categoria: CategoriaId, porNivel: Record<Nivel, Entrada[]>): Pergunta[] {
  const lista: Pergunta[] = [];
  for (const nivel of [1, 2, 3, 4, 5] as Nivel[]) {
    porNivel[nivel].forEach(([enunciado, alternativas, correta, explicacao], i) => {
      lista.push({
        id: `${categoria}-${nivel}-${String(i + 1).padStart(2, '0')}`,
        categoria,
        nivel,
        enunciado,
        alternativas,
        correta,
        explicacao,
      });
    });
  }
  return lista;
}
