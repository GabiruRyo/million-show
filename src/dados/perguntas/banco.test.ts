import { describe, expect, it } from 'vitest';
import { BANCO_PERGUNTAS } from './index';
import { formatarRelatorio, validarBanco } from '../validacao';

describe('banco de perguntas', () => {
  const relatorio = validarBanco(BANCO_PERGUNTAS);

  it('imprime o relatório do banco', () => {
    console.log(`\n${formatarRelatorio(relatorio)}\n`);
    expect(relatorio.total).toBeGreaterThan(0);
  });

  it('não tem problemas de estrutura, duplicidade ou balanceamento', () => {
    const resumo = relatorio.problemas
      .slice(0, 40)
      .map((p) => `[${p.tipo}] ${p.perguntaId}: ${p.detalhe}`)
      .join('\n');
    expect(resumo, `\n${resumo}`).toBe('');
  });

  it('tem 1.600 perguntas (16 categorias × 5 níveis × 20)', () => {
    expect(relatorio.total).toBe(1600);
  });
});
