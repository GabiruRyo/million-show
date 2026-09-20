/**
 * Verificação rápida do banco de perguntas, usada durante a escrita do conteúdo.
 * Usa o esbuild que já vem com o Vite para compilar o TypeScript e aplica as mesmas
 * regras de src/dados/validacao.ts. Categorias ainda vazias são ignoradas.
 *
 *   node scripts/checar.mjs            # relatório completo
 *   node scripts/checar.mjs futebol    # só as categorias informadas
 */
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const alvos = process.argv.slice(2).filter((a) => !a.startsWith('-'));

const pasta = await mkdtemp(join(tmpdir(), 'sdm-'));
const saida = join(pasta, 'banco.mjs');

await build({
  entryPoints: ['scripts/entrada-checagem.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: saida,
  logLevel: 'error',
});

const { BANCO_PERGUNTAS, validarBanco, formatarRelatorio } = await import(pathToFileURL(saida).href);
await rm(pasta, { recursive: true, force: true });

const banco = alvos.length
  ? BANCO_PERGUNTAS.filter((p) => alvos.some((a) => p.categoria.includes(a)))
  : BANCO_PERGUNTAS;

const relatorio = validarBanco(banco);

// Ignora a cobrança de contagem para categorias que ainda não foram escritas.
const vazias = new Set(
  relatorio.porCategoria.filter((c) => c.total === 0).map((c) => c.categoria),
);
relatorio.problemas = relatorio.problemas.filter(
  (p) => !(p.tipo === 'contagem-nivel' && vazias.has(p.perguntaId.replace(/-\d$/, ''))),
);
relatorio.porCategoria = relatorio.porCategoria.filter((c) => c.total > 0);

console.log(formatarRelatorio(relatorio));
process.exit(relatorio.problemas.length > 0 ? 1 : 0);
