import type { CategoriaId, Nivel, Pergunta } from '../tipos';
import { CATEGORIAS } from './categorias';
import { normalizar } from '../utilitarios/extenso';

/**
 * Normalização leve, usada para comparar alternativas entre si: apenas caixa e espaços.
 * Símbolos como "−", "/" e expoentes distinguem alternativas legítimas em matemática,
 * então não podem ser descartados aqui como são na busca por enunciados duplicados.
 */
function normalizarLeve(texto: string): string {
  return texto.toLowerCase().replace(/\s+/g, ' ').trim();
}

export const META_POR_NIVEL = 20;
export const NIVEIS: Nivel[] = [1, 2, 3, 4, 5];
export const LIMITE_ENUNCIADO = 220;
export const LIMITE_ALTERNATIVA = 120;
export const LIMITE_EXPLICACAO = 400;
/** Nenhuma letra pode concentrar mais que esta fatia do gabarito de uma categoria. */
export const MAXIMO_GABARITO = 0.35;

export interface Problema {
  perguntaId: string;
  tipo: string;
  detalhe: string;
}

export interface RelatorioCategoria {
  categoria: CategoriaId;
  total: number;
  porNivel: Record<Nivel, number>;
  gabarito: [number, number, number, number];
}

export interface Relatorio {
  total: number;
  problemas: Problema[];
  porCategoria: RelatorioCategoria[];
  gabaritoGeral: [number, number, number, number];
}

function validarPergunta(pergunta: Pergunta, problemas: Problema[]): void {
  const anotar = (tipo: string, detalhe: string) =>
    problemas.push({ perguntaId: pergunta.id, tipo, detalhe });

  if (!/^[a-z-]+-[1-5]-\d{2}$/.test(pergunta.id)) {
    anotar('id-formato', `id "${pergunta.id}" fora do padrão categoria-nivel-NN`);
  }
  if (!pergunta.id.startsWith(`${pergunta.categoria}-${pergunta.nivel}-`)) {
    anotar('id-incoerente', `id não corresponde a ${pergunta.categoria} nível ${pergunta.nivel}`);
  }
  if (pergunta.enunciado.trim().length < 12) anotar('enunciado-curto', pergunta.enunciado);
  if (pergunta.enunciado.length > LIMITE_ENUNCIADO) {
    anotar('enunciado-longo', `${pergunta.enunciado.length} caracteres`);
  }
  if (pergunta.alternativas.length !== 4) {
    anotar('alternativas-quantidade', `${pergunta.alternativas.length} alternativas`);
  }
  for (const alternativa of pergunta.alternativas) {
    if (!alternativa || alternativa.trim().length === 0) anotar('alternativa-vazia', 'alternativa em branco');
    if (alternativa.length > LIMITE_ALTERNATIVA) {
      anotar('alternativa-longa', `${alternativa.length} caracteres: ${alternativa.slice(0, 40)}…`);
    }
  }
  const unicas = new Set(pergunta.alternativas.map((a) => normalizarLeve(a)));
  if (unicas.size !== pergunta.alternativas.length) {
    anotar('alternativa-repetida', pergunta.alternativas.join(' | '));
  }
  if (![0, 1, 2, 3].includes(pergunta.correta)) {
    anotar('gabarito-invalido', String(pergunta.correta));
  }
  if (pergunta.explicacao.trim().length < 15) anotar('explicacao-curta', pergunta.explicacao);
  if (pergunta.explicacao.length > LIMITE_EXPLICACAO) {
    anotar('explicacao-longa', `${pergunta.explicacao.length} caracteres`);
  }
  if (!NIVEIS.includes(pergunta.nivel)) anotar('nivel-invalido', String(pergunta.nivel));
}

export function validarBanco(banco: Pergunta[]): Relatorio {
  const problemas: Problema[] = [];
  const vistosId = new Map<string, number>();
  const vistosEnunciado = new Map<string, string>();
  const gabaritoGeral: [number, number, number, number] = [0, 0, 0, 0];

  for (const pergunta of banco) {
    validarPergunta(pergunta, problemas);

    const repetidoId = vistosId.get(pergunta.id) ?? 0;
    if (repetidoId > 0) {
      problemas.push({ perguntaId: pergunta.id, tipo: 'id-duplicado', detalhe: 'id usado mais de uma vez' });
    }
    vistosId.set(pergunta.id, repetidoId + 1);

    const chave = normalizar(pergunta.enunciado);
    const anterior = vistosEnunciado.get(chave);
    if (anterior) {
      problemas.push({
        perguntaId: pergunta.id,
        tipo: 'enunciado-duplicado',
        detalhe: `mesmo enunciado de ${anterior}`,
      });
    } else {
      vistosEnunciado.set(chave, pergunta.id);
    }

    gabaritoGeral[pergunta.correta] += 1;
  }

  const porCategoria: RelatorioCategoria[] = CATEGORIAS.map((categoria) => {
    const perguntas = banco.filter((p) => p.categoria === categoria.id);
    const porNivel = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<Nivel, number>;
    const gabarito: [number, number, number, number] = [0, 0, 0, 0];
    for (const pergunta of perguntas) {
      porNivel[pergunta.nivel] += 1;
      gabarito[pergunta.correta] += 1;
    }

    for (const nivel of NIVEIS) {
      if (porNivel[nivel] !== META_POR_NIVEL) {
        problemas.push({
          perguntaId: `${categoria.id}-${nivel}`,
          tipo: 'contagem-nivel',
          detalhe: `${porNivel[nivel]} perguntas no nível ${nivel} (meta: ${META_POR_NIVEL})`,
        });
      }
    }

    if (perguntas.length > 0) {
      gabarito.forEach((quantidade, letra) => {
        const fatia = quantidade / perguntas.length;
        if (fatia > MAXIMO_GABARITO) {
          problemas.push({
            perguntaId: categoria.id,
            tipo: 'gabarito-desbalanceado',
            detalhe: `letra ${'ABCD'[letra]} em ${Math.round(fatia * 100)}% das perguntas`,
          });
        }
      });
    }

    return { categoria: categoria.id, total: perguntas.length, porNivel, gabarito };
  });

  return { total: banco.length, problemas, porCategoria, gabaritoGeral };
}

export function formatarRelatorio(relatorio: Relatorio): string {
  const linhas: string[] = [];
  linhas.push(`Banco com ${relatorio.total} perguntas.`);
  linhas.push('');
  linhas.push('Categoria                     Total   N1  N2  N3  N4  N5    A   B   C   D');
  for (const item of relatorio.porCategoria) {
    const nivelTexto = NIVEIS.map((n) => String(item.porNivel[n]).padStart(2)).join('  ');
    const gabaritoTexto = item.gabarito.map((g) => String(g).padStart(2)).join('  ');
    linhas.push(
      `${item.categoria.padEnd(28)}${String(item.total).padStart(5)}   ${nivelTexto}    ${gabaritoTexto}`,
    );
  }
  linhas.push('');
  linhas.push(
    `Gabarito geral: A=${relatorio.gabaritoGeral[0]} B=${relatorio.gabaritoGeral[1]} ` +
      `C=${relatorio.gabaritoGeral[2]} D=${relatorio.gabaritoGeral[3]}`,
  );
  if (relatorio.problemas.length === 0) {
    linhas.push('✅ Nenhum problema encontrado.');
  } else {
    linhas.push(`❌ ${relatorio.problemas.length} problema(s):`);
    for (const problema of relatorio.problemas.slice(0, 60)) {
      linhas.push(`   [${problema.tipo}] ${problema.perguntaId}: ${problema.detalhe}`);
    }
    if (relatorio.problemas.length > 60) {
      linhas.push(`   ... e mais ${relatorio.problemas.length - 60}.`);
    }
  }
  return linhas.join('\n');
}
