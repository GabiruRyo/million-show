import { describe, expect, it } from 'vitest';
import type { IndiceAlternativa, Pergunta } from '../tipos';
import {
  acumuladoApos,
  calcularPremio,
  confirmar,
  criarPartida,
  parar,
  proxima,
  pular,
  revelar,
  selecionar,
  tique,
  usarAjuda,
} from './maquina';
import { REGRAS_PRESET } from './regras';
import { PREMIOS } from '../dados/premios';

function perguntaFalsa(indice: number): Pergunta {
  return {
    id: `teste-1-${String(indice).padStart(2, '0')}`,
    categoria: 'curiosidades',
    nivel: 1,
    enunciado: `Pergunta de teste número ${indice}?`,
    alternativas: ['Alfa', 'Bravo', 'Charlie', 'Delta'],
    correta: (indice % 4) as IndiceAlternativa,
    explicacao: 'Explicação de teste com tamanho suficiente para passar na validação.',
  };
}

const PERGUNTAS = Array.from({ length: 16 }, (_, i) => perguntaFalsa(i));

function partidaClassica(preset: keyof typeof REGRAS_PRESET = 'classico') {
  return criarPartida({
    modo: 'classico',
    perguntas: PERGUNTAS,
    semente: 42,
    regras: REGRAS_PRESET[preset],
  });
}

/** Responde corretamente a pergunta atual e avança. */
function acertarEavancar(estado: ReturnType<typeof partidaClassica>) {
  const pergunta = estado.perguntas[estado.indice];
  return proxima(revelar(confirmar(selecionar(estado, pergunta.correta))));
}

describe('máquina da partida', () => {
  it('começa na primeira pergunta com as ajudas completas', () => {
    const estado = partidaClassica();
    expect(estado.indice).toBe(0);
    expect(estado.fase).toBe('respondendo');
    expect(estado.ajudasDisponiveis).toEqual({ pular: 3, cartas: 1, universitarios: 1, placas: 1 });
    expect(estado.acumulado).toBe(0);
  });

  it('não confirma sem uma alternativa escolhida', () => {
    const estado = partidaClassica();
    expect(confirmar(estado).fase).toBe('respondendo');
  });

  it('acumula o prêmio a cada acerto', () => {
    let estado = partidaClassica();
    estado = acertarEavancar(estado);
    expect(estado.acumulado).toBe(PREMIOS[0]);
    estado = acertarEavancar(estado);
    expect(estado.acumulado).toBe(PREMIOS[1]);
    expect(estado.indice).toBe(2);
  });

  it('encerra ao errar e paga metade do acumulado no preset clássico', () => {
    let estado = partidaClassica();
    for (let i = 0; i < 5; i++) estado = acertarEavancar(estado);
    expect(estado.acumulado).toBe(PREMIOS[4]);

    const pergunta = estado.perguntas[estado.indice];
    const errada = ((pergunta.correta + 1) % 4) as IndiceAlternativa;
    const depois = revelar(confirmar(selecionar(estado, errada)));

    expect(depois.motivoFim).toBe('errou');
    expect(depois.premioFinal).toBe(PREMIOS[4] / 2);
  });

  it('zera o prêmio ao errar no preset radical', () => {
    let estado = partidaClassica('radical');
    estado = acertarEavancar(estado);
    const pergunta = estado.perguntas[estado.indice];
    const errada = ((pergunta.correta + 2) % 4) as IndiceAlternativa;
    const depois = revelar(confirmar(selecionar(estado, errada)));
    expect(depois.premioFinal).toBe(0);
  });

  it('garante o patamar de R$ 5 mil no preset patamares', () => {
    let estado = partidaClassica('patamares');
    for (let i = 0; i < 7; i++) estado = acertarEavancar(estado);
    const pergunta = estado.perguntas[estado.indice];
    const errada = ((pergunta.correta + 3) % 4) as IndiceAlternativa;
    const depois = revelar(confirmar(selecionar(estado, errada)));
    expect(depois.premioFinal).toBe(5_000);
  });

  it('paga o milhão ao acertar a décima sexta pergunta', () => {
    let estado = partidaClassica();
    for (let i = 0; i < 15; i++) estado = acertarEavancar(estado);
    expect(estado.indice).toBe(15);
    const pergunta = estado.perguntas[15];
    const final = revelar(confirmar(selecionar(estado, pergunta.correta)));
    expect(final.motivoFim).toBe('acertou-milhao');
    expect(final.premioFinal).toBe(1_000_000);
  });

  it('não paga nada ao errar a pergunta do milhão', () => {
    let estado = partidaClassica();
    for (let i = 0; i < 15; i++) estado = acertarEavancar(estado);
    const pergunta = estado.perguntas[15];
    const errada = ((pergunta.correta + 1) % 4) as IndiceAlternativa;
    const final = revelar(confirmar(selecionar(estado, errada)));
    expect(final.premioFinal).toBe(0);
  });

  it('garante R$ 500 mil ao parar na pergunta do milhão', () => {
    let estado = partidaClassica();
    for (let i = 0; i < 15; i++) estado = acertarEavancar(estado);
    expect(parar(estado).premioFinal).toBe(500_000);
  });

  it('parar no meio do jogo paga o acumulado', () => {
    let estado = partidaClassica();
    for (let i = 0; i < 6; i++) estado = acertarEavancar(estado);
    expect(parar(estado).premioFinal).toBe(PREMIOS[5]);
    expect(parar(estado).motivoFim).toBe('parou');
  });

  it('pular troca de pergunta sem alterar o acumulado', () => {
    let estado = partidaClassica();
    estado = acertarEavancar(estado);
    const antes = estado.acumulado;
    const depois = pular(estado);
    expect(depois.indice).toBe(estado.indice + 1);
    expect(depois.acumulado).toBe(antes);
    expect(depois.ajudasDisponiveis.pular).toBe(2);
    expect(depois.historico[depois.historico.length - 1].pulada).toBe(true);
  });

  it('não deixa pular sem pulos restantes', () => {
    let estado = partidaClassica();
    estado = pular(pular(pular(estado)));
    expect(estado.ajudasDisponiveis.pular).toBe(0);
    const indiceAntes = estado.indice;
    expect(pular(estado).indice).toBe(indiceAntes);
  });

  it('as cartas eliminam duas alternativas erradas', () => {
    const estado = usarAjuda(partidaClassica(), 'cartas');
    expect(estado.eliminadas).toHaveLength(2);
    expect(estado.eliminadas).not.toContain(estado.perguntas[0].correta);
    expect(estado.ajudasDisponiveis.cartas).toBe(0);
  });

  it('ignora a escolha de uma alternativa eliminada', () => {
    const estado = usarAjuda(partidaClassica(), 'cartas');
    const eliminada = estado.eliminadas[0];
    expect(selecionar(estado, eliminada).escolha).toBeNull();
  });

  it('os universitários e a plateia respondem com percentuais somando 100', () => {
    const universitarios = usarAjuda(partidaClassica(), 'universitarios');
    expect(universitarios.ajudaAtiva?.tipo).toBe('universitarios');
    if (universitarios.ajudaAtiva?.tipo === 'universitarios') {
      expect(universitarios.ajudaAtiva.opinioes).toHaveLength(3);
    }

    const placas = usarAjuda(partidaClassica(), 'placas');
    if (placas.ajudaAtiva?.tipo === 'placas') {
      const soma = placas.ajudaAtiva.percentuais.reduce((s, p) => s + p, 0);
      expect(soma).toBe(100);
    }
  });

  it('o cronômetro encerra a partida quando o tempo zera', () => {
    let estado = criarPartida({
      modo: 'classico',
      perguntas: PERGUNTAS,
      semente: 7,
      regras: { ...REGRAS_PRESET.classico, tempoPorPergunta: 3 },
    });
    estado = tique(tique(tique(estado)));
    expect(estado.motivoFim).toBe('tempo');
  });

  it('acumuladoApos segue a escada de prêmios', () => {
    expect(acumuladoApos(0)).toBe(1_000);
    expect(acumuladoApos(10)).toBe(100_000);
    expect(acumuladoApos(15)).toBe(1_000_000);
  });

  it('modos livres não pagam prêmio em dinheiro', () => {
    const treino = criarPartida({ modo: 'treino', perguntas: PERGUNTAS, semente: 1 });
    expect(calcularPremio(treino, 'parou')).toBe(0);
    expect(treino.ajudasDisponiveis.cartas).toBe(0);
  });

  it('sobrevivência só termina quando as vidas acabam', () => {
    let estado = criarPartida({ modo: 'sobrevivencia', perguntas: PERGUNTAS, semente: 3, vidas: 3 });
    const errar = (atual: typeof estado) => {
      const pergunta = atual.perguntas[atual.indice];
      const errada = ((pergunta.correta + 1) % 4) as IndiceAlternativa;
      return revelar(confirmar(selecionar(atual, errada)));
    };
    estado = proxima(errar(estado));
    expect(estado.motivoFim).toBeNull();
    expect(estado.vidas).toBe(2);
    estado = proxima(errar(estado));
    estado = errar(estado);
    expect(estado.vidas).toBe(0);
    expect(estado.motivoFim).toBe('errou');
  });
});
