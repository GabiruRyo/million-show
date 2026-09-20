import type { CategoriaId, Nivel, Pergunta } from '../../tipos';
import { perguntasHistoriaBrasil } from './historia-brasil';
import { perguntasHistoriaGeral } from './historia-geral';
import { perguntasGeografiaBrasil } from './geografia-brasil';
import { perguntasGeografiaMundial } from './geografia-mundial';
import { perguntasBiologiaCorpo } from './biologia-corpo';
import { perguntasFisicaQuimica } from './fisica-quimica';
import { perguntasMatematicaLogica } from './matematica-logica';
import { perguntasLinguaPortuguesa } from './lingua-portuguesa';
import { perguntasLiteratura } from './literatura';
import { perguntasMusica } from './musica';
import { perguntasCinemaTv } from './cinema-tv';
import { perguntasFutebol } from './futebol';
import { perguntasEsportes } from './esportes';
import { perguntasTecnologia } from './tecnologia';
import { perguntasArteMitologia } from './arte-mitologia';
import { perguntasCuriosidades } from './curiosidades';

export const PERGUNTAS_POR_CATEGORIA: Record<CategoriaId, Pergunta[]> = {
  'historia-brasil': perguntasHistoriaBrasil,
  'historia-geral': perguntasHistoriaGeral,
  'geografia-brasil': perguntasGeografiaBrasil,
  'geografia-mundial': perguntasGeografiaMundial,
  'biologia-corpo': perguntasBiologiaCorpo,
  'fisica-quimica': perguntasFisicaQuimica,
  'matematica-logica': perguntasMatematicaLogica,
  'lingua-portuguesa': perguntasLinguaPortuguesa,
  literatura: perguntasLiteratura,
  musica: perguntasMusica,
  'cinema-tv': perguntasCinemaTv,
  futebol: perguntasFutebol,
  esportes: perguntasEsportes,
  tecnologia: perguntasTecnologia,
  'arte-mitologia': perguntasArteMitologia,
  curiosidades: perguntasCuriosidades,
};

/** Banco completo de perguntas do jogo. */
export const BANCO_PERGUNTAS: Pergunta[] = Object.values(PERGUNTAS_POR_CATEGORIA).flat();

export const TOTAL_NO_BANCO = BANCO_PERGUNTAS.length;

export function perguntasDoNivel(nivel: Nivel): Pergunta[] {
  return BANCO_PERGUNTAS.filter((p) => p.nivel === nivel);
}

export function contarPorCategoria(): Record<CategoriaId, number> {
  const contagem = {} as Record<CategoriaId, number>;
  for (const [categoria, lista] of Object.entries(PERGUNTAS_POR_CATEGORIA)) {
    contagem[categoria as CategoriaId] = lista.length;
  }
  return contagem;
}
