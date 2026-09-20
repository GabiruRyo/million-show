import type {
  CategoriaId,
  Configuracoes,
  EstatisticaCategoria,
  Perfil,
  PerguntaCustomizada,
  RegistroHistorico,
} from '../tipos';
import { REGRAS_PADRAO } from '../jogo/regras';

const VERSAO = 1;
const PREFIXO = `sdm.v${VERSAO}`;

const CHAVES = {
  perfil: `${PREFIXO}.perfil`,
  historico: `${PREFIXO}.historico`,
  config: `${PREFIXO}.config`,
  estatisticas: `${PREFIXO}.estatisticas`,
  customizadas: `${PREFIXO}.perguntas`,
  vistas: `${PREFIXO}.vistas`,
} as const;

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    if (!bruto) return padrao;
    return JSON.parse(bruto) as T;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* modo anônimo ou armazenamento cheio: o jogo continua sem persistir */
  }
}

export const CONFIG_PADRAO: Configuracoes = {
  som: true,
  volume: 0.6,
  animacoes: true,
  regras: REGRAS_PADRAO,
  mostrarExplicacao: true,
};

export const armazenamento = {
  lerPerfil(): Perfil | null {
    return ler<Perfil | null>(CHAVES.perfil, null);
  },
  salvarPerfil(perfil: Perfil): void {
    gravar(CHAVES.perfil, perfil);
  },

  lerConfig(): Configuracoes {
    return { ...CONFIG_PADRAO, ...ler<Partial<Configuracoes>>(CHAVES.config, {}) };
  },
  salvarConfig(config: Configuracoes): void {
    gravar(CHAVES.config, config);
  },

  lerHistorico(): RegistroHistorico[] {
    return ler<RegistroHistorico[]>(CHAVES.historico, []);
  },
  adicionarHistorico(registro: RegistroHistorico): RegistroHistorico[] {
    const lista = [registro, ...armazenamento.lerHistorico()].slice(0, 200);
    gravar(CHAVES.historico, lista);
    return lista;
  },
  limparHistorico(): void {
    gravar(CHAVES.historico, []);
  },

  lerEstatisticas(): Record<CategoriaId, EstatisticaCategoria> {
    return ler<Record<CategoriaId, EstatisticaCategoria>>(
      CHAVES.estatisticas,
      {} as Record<CategoriaId, EstatisticaCategoria>,
    );
  },
  registrarEstatisticas(
    entradas: { categoria: CategoriaId; acertou: boolean }[],
  ): Record<CategoriaId, EstatisticaCategoria> {
    const atual = armazenamento.lerEstatisticas();
    for (const entrada of entradas) {
      const registro = atual[entrada.categoria] ?? { acertos: 0, erros: 0 };
      if (entrada.acertou) registro.acertos += 1;
      else registro.erros += 1;
      atual[entrada.categoria] = registro;
    }
    gravar(CHAVES.estatisticas, atual);
    return atual;
  },
  limparEstatisticas(): void {
    gravar(CHAVES.estatisticas, {});
  },

  lerCustomizadas(): PerguntaCustomizada[] {
    return ler<PerguntaCustomizada[]>(CHAVES.customizadas, []);
  },
  salvarCustomizadas(lista: PerguntaCustomizada[]): void {
    gravar(CHAVES.customizadas, lista);
  },

  /** Perguntas já sorteadas recentemente, para não repetir entre partidas. */
  lerVistas(): string[] {
    return ler<string[]>(CHAVES.vistas, []);
  },
  registrarVistas(ids: string[]): void {
    const lista = [...ids, ...armazenamento.lerVistas()].slice(0, 400);
    gravar(CHAVES.vistas, Array.from(new Set(lista)));
  },
  limparVistas(): void {
    gravar(CHAVES.vistas, []);
  },
};
