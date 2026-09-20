import { describe, expect, it } from 'vitest';
import type { IndiceAlternativa, Nivel, Pergunta } from '../tipos';
import { sortearFila, sortearPartida } from './sorteio';
import { criarRng, embaralhar } from './aleatorio';
import { DISTRIBUICAO_NIVEIS } from '../dados/premios';

function bancoFalso(porNivel = 30): Pergunta[] {
  const lista: Pergunta[] = [];
  for (const nivel of [1, 2, 3, 4, 5] as Nivel[]) {
    for (let i = 0; i < porNivel; i++) {
      lista.push({
        id: `curiosidades-${nivel}-${String(i).padStart(2, '0')}`,
        categoria: i % 2 === 0 ? 'curiosidades' : 'futebol',
        nivel,
        enunciado: `Pergunta ${nivel}-${i} para teste de sorteio?`,
        alternativas: ['A', 'B', 'C', 'D'],
        correta: (i % 4) as IndiceAlternativa,
        explicacao: 'Explicação suficientemente longa para o validador.',
      });
    }
  }
  return lista;
}

describe('sorteio', () => {
  it('monta 16 perguntas na distribuição de níveis esperada', () => {
    const partida = sortearPartida(bancoFalso(), { semente: 99 });
    expect(partida).toHaveLength(16);
    for (const nivel of [1, 2, 3, 4, 5] as Nivel[]) {
      expect(partida.filter((p) => p.nivel === nivel)).toHaveLength(DISTRIBUICAO_NIVEIS[nivel]);
    }
  });

  it('entrega as perguntas em ordem crescente de dificuldade', () => {
    const partida = sortearPartida(bancoFalso(), { semente: 5 });
    const niveis = partida.map((p) => p.nivel);
    expect([...niveis].sort((a, b) => a - b)).toEqual(niveis);
  });

  it('nunca repete a mesma pergunta na partida', () => {
    const partida = sortearPartida(bancoFalso(), { semente: 12 });
    expect(new Set(partida.map((p) => p.id)).size).toBe(partida.length);
  });

  it('é determinístico para a mesma semente', () => {
    const a = sortearPartida(bancoFalso(), { semente: 777 }).map((p) => p.id);
    const b = sortearPartida(bancoFalso(), { semente: 777 }).map((p) => p.id);
    const c = sortearPartida(bancoFalso(), { semente: 778 }).map((p) => p.id);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it('respeita as categorias escolhidas', () => {
    const fila = sortearFila(bancoFalso(), { semente: 3, categorias: ['futebol'], quantidade: 10 });
    expect(fila.every((p) => p.categoria === 'futebol')).toBe(true);
    expect(fila).toHaveLength(10);
  });

  it('evita perguntas já vistas quando há banco suficiente', () => {
    const banco = bancoFalso();
    const primeira = sortearPartida(banco, { semente: 1 });
    const evitar = new Set(primeira.map((p) => p.id));
    const segunda = sortearPartida(banco, { semente: 2, evitar });
    expect(segunda.some((p) => evitar.has(p.id))).toBe(false);
  });

  it('completa com níveis vizinhos quando falta pergunta de um nível', () => {
    const banco = bancoFalso().filter((p) => p.nivel !== 5);
    const partida = sortearPartida(banco, { semente: 8 });
    expect(partida).toHaveLength(16);
  });

  it('embaralhar preserva os elementos', () => {
    const rng = criarRng(10);
    const original = [1, 2, 3, 4, 5, 6];
    const misturado = embaralhar(rng, original);
    expect([...misturado].sort()).toEqual(original);
    expect(original).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
