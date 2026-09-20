import type { CategoriaId, Nivel, Pergunta } from '../tipos';
import { DISTRIBUICAO_NIVEIS, TOTAL_PERGUNTAS, nivelDaPergunta } from '../dados/premios';
import { embaralhar, criarRng, type Rng } from './aleatorio';

export interface OpcoesSorteio {
  semente: number;
  /** Se informado, sorteia apenas destas categorias. */
  categorias?: CategoriaId[];
  /** Perguntas já usadas (ids) que devem ser evitadas quando possível. */
  evitar?: Set<string>;
}

function filtrarPorCategorias(banco: Pergunta[], categorias?: CategoriaId[]): Pergunta[] {
  if (!categorias || categorias.length === 0) return banco;
  const permitidas = new Set(categorias);
  return banco.filter((p) => permitidas.has(p.categoria));
}

function tirarDoNivel(
  porNivel: Map<Nivel, Pergunta[]>,
  nivel: Nivel,
  quantidade: number,
  usadas: Set<string>,
): Pergunta[] {
  const disponiveis = porNivel.get(nivel) ?? [];
  const escolhidas: Pergunta[] = [];
  for (const pergunta of disponiveis) {
    if (escolhidas.length >= quantidade) break;
    if (usadas.has(pergunta.id)) continue;
    usadas.add(pergunta.id);
    escolhidas.push(pergunta);
  }
  return escolhidas;
}

/** Agrupa o banco por nível, já embaralhado de forma determinística. */
function agruparEmbaralhado(banco: Pergunta[], rng: Rng): Map<Nivel, Pergunta[]> {
  const mapa = new Map<Nivel, Pergunta[]>();
  for (const pergunta of banco) {
    const lista = mapa.get(pergunta.nivel);
    if (lista) lista.push(pergunta);
    else mapa.set(pergunta.nivel, [pergunta]);
  }
  for (const [nivel, lista] of mapa) mapa.set(nivel, embaralhar(rng, lista));
  return mapa;
}

/**
 * Sorteia as 16 perguntas de uma partida clássica, em ordem crescente de dificuldade.
 * Se faltarem perguntas de algum nível, completa com o nível mais próximo disponível.
 */
export function sortearPartida(banco: Pergunta[], opcoes: OpcoesSorteio): Pergunta[] {
  const rng = criarRng(opcoes.semente);
  const filtrado = filtrarPorCategorias(banco, opcoes.categorias);
  const porNivel = agruparEmbaralhado(filtrado, rng);
  const usadas = new Set<string>(opcoes.evitar ?? []);

  const selecionadas: Pergunta[] = [];
  for (const nivelTexto of Object.keys(DISTRIBUICAO_NIVEIS)) {
    const nivel = Number(nivelTexto) as Nivel;
    const quantidade = DISTRIBUICAO_NIVEIS[nivel];
    let escolhidas = tirarDoNivel(porNivel, nivel, quantidade, usadas);

    // Completa com níveis vizinhos quando o banco não tem perguntas suficientes.
    let distancia = 1;
    while (escolhidas.length < quantidade && distancia <= 4) {
      for (const candidato of [nivel - distancia, nivel + distancia] as Nivel[]) {
        if (candidato < 1 || candidato > 5) continue;
        const faltam = quantidade - escolhidas.length;
        if (faltam <= 0) break;
        escolhidas = escolhidas.concat(tirarDoNivel(porNivel, candidato, faltam, usadas));
      }
      distancia++;
    }
    selecionadas.push(...escolhidas);
  }

  // Ordena pela dificuldade esperada de cada degrau da escada.
  selecionadas.sort((a, b) => a.nivel - b.nivel);
  return selecionadas.slice(0, TOTAL_PERGUNTAS);
}

/** Sorteia uma fila de perguntas para os modos livres (treino, contra-relógio, sobrevivência). */
export function sortearFila(
  banco: Pergunta[],
  opcoes: OpcoesSorteio & { quantidade: number; nivelMaximo?: Nivel; progressivo?: boolean },
): Pergunta[] {
  const rng = criarRng(opcoes.semente);
  const filtrado = filtrarPorCategorias(banco, opcoes.categorias).filter(
    (p) => !opcoes.nivelMaximo || p.nivel <= opcoes.nivelMaximo,
  );
  const evitar = opcoes.evitar ?? new Set<string>();
  const disponiveis = embaralhar(rng, filtrado).filter((p) => !evitar.has(p.id));
  const fila = disponiveis.slice(0, opcoes.quantidade);
  if (opcoes.progressivo) fila.sort((a, b) => a.nivel - b.nivel);
  return fila;
}

export { nivelDaPergunta };
