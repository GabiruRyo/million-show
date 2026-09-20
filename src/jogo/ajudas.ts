import type {
  IndiceAlternativa,
  Nivel,
  OpiniaoUniversitario,
  Pergunta,
  ResultadoCartas,
  ResultadoPlacas,
  ResultadoUniversitarios,
} from '../tipos';
import { criarRng, embaralhar, escolher, inteiro, type Rng } from './aleatorio';

export const LETRAS = ['A', 'B', 'C', 'D'] as const;

const NOMES_UNIVERSITARIOS = [
  'Bianca', 'Rafael', 'Camila', 'Thiago', 'Larissa', 'Douglas', 'Juliana', 'Marcelo',
  'Patrícia', 'Vinícius', 'Aline', 'Gustavo', 'Renata', 'Leandro', 'Tatiane', 'Fábio',
  'Débora', 'Henrique', 'Priscila', 'Rodrigo', 'Simone', 'Otávio', 'Carolina', 'Bruno',
  'Mariana', 'Everton', 'Nathália', 'Wesley', 'Letícia', 'Anderson',
];

const CURSOS = [
  'Direito', 'Medicina', 'Engenharia Civil', 'História', 'Letras', 'Física',
  'Jornalismo', 'Biologia', 'Matemática', 'Geografia', 'Publicidade', 'Química',
  'Administração', 'Psicologia', 'Arquitetura', 'Ciência da Computação', 'Pedagogia',
  'Filosofia', 'Educação Física', 'Veterinária', 'Enfermagem', 'Artes Cênicas',
];

const FALAS_CERTEZA = [
  'Essa eu estudei semana passada, é a letra {L} com toda a certeza.',
  'Sem dúvida nenhuma: letra {L}. Pode marcar tranquilo.',
  'Caiu na minha prova esse ano. É {L}, pode confiar.',
  'Eu ponho a mão no fogo: alternativa {L}.',
  'É exatamente o que o professor cobrou na faculdade: letra {L}.',
];

const FALAS_ACHO = [
  'Eu acho que é a {L}, mas confesso que fiquei na dúvida com outra.',
  'Pela lógica das alternativas, eu iria de {L}.',
  'Tenho quase certeza que é {L}, só não arriscaria tudo nisso.',
  'Lembro de ter lido algo assim... vou de {L}.',
  'A minha memória diz {L}, mas não é uma certeza absoluta.',
];

const FALAS_CHUTE = [
  'Olha, aí você me pegou. Vou no chute: {L}.',
  'Não faço ideia, mas as outras parecem estranhas. Marco {L}.',
  'Chute honesto: letra {L}. Não leva muito a sério.',
  'Se eu tivesse que apostar, apostaria em {L} — mas é só palpite.',
  'Essa não é a minha área, hein. Diria {L} por eliminação.',
];

/** Probabilidade de um universitário acertar, por nível de dificuldade. */
const ACERTO_UNIVERSITARIO: Record<Nivel, number> = {
  1: 0.94,
  2: 0.86,
  3: 0.72,
  4: 0.56,
  5: 0.38,
};

/** Probabilidade de a plateia concentrar votos na alternativa certa. */
const ACERTO_PLATEIA: Record<Nivel, number> = {
  1: 0.9,
  2: 0.82,
  3: 0.68,
  4: 0.52,
  5: 0.36,
};

function outrasAlternativas(
  correta: IndiceAlternativa,
  eliminadas: IndiceAlternativa[] = [],
): IndiceAlternativa[] {
  return ([0, 1, 2, 3] as IndiceAlternativa[]).filter(
    (i) => i !== correta && !eliminadas.includes(i),
  );
}

/** Cartas: elimina duas alternativas erradas (o clássico "50 por 50"). */
export function usarCartas(pergunta: Pergunta, semente: number): ResultadoCartas {
  const rng = criarRng(semente);
  const erradas = embaralhar(rng, outrasAlternativas(pergunta.correta));
  return { tipo: 'cartas', eliminadas: erradas.slice(0, 2).sort((a, b) => a - b) };
}

/** Universitários: três estudantes opinam, com viés de acerto conforme a dificuldade. */
export function usarUniversitarios(
  pergunta: Pergunta,
  semente: number,
  eliminadas: IndiceAlternativa[] = [],
): ResultadoUniversitarios {
  const rng = criarRng(semente);
  const nomes = embaralhar(rng, NOMES_UNIVERSITARIOS).slice(0, 3);
  const cursos = embaralhar(rng, CURSOS).slice(0, 3);
  const chanceAcerto = ACERTO_UNIVERSITARIO[pergunta.nivel];
  const alternativasErradas = outrasAlternativas(pergunta.correta, eliminadas);

  const opinioes: OpiniaoUniversitario[] = nomes.map((nome, i) => {
    const acertou = rng() < chanceAcerto;
    const escolha: IndiceAlternativa =
      acertou || alternativasErradas.length === 0
        ? pergunta.correta
        : escolher(rng, alternativasErradas);

    const sorteioConfianca = rng();
    const confianca: OpiniaoUniversitario['confianca'] = acertou
      ? sorteioConfianca < 0.55
        ? 'certeza'
        : sorteioConfianca < 0.9
          ? 'acho'
          : 'chute'
      : sorteioConfianca < 0.25
        ? 'certeza'
        : sorteioConfianca < 0.6
          ? 'acho'
          : 'chute';

    const banco =
      confianca === 'certeza' ? FALAS_CERTEZA : confianca === 'acho' ? FALAS_ACHO : FALAS_CHUTE;

    return {
      nome,
      curso: cursos[i],
      escolha,
      confianca,
      fala: escolher(rng, banco).replace('{L}', LETRAS[escolha]),
    };
  });

  const votos = new Map<IndiceAlternativa, number>();
  for (const opiniao of opinioes) {
    votos.set(opiniao.escolha, (votos.get(opiniao.escolha) ?? 0) + 1);
  }
  let consenso: IndiceAlternativa | null = null;
  let melhor = 0;
  for (const [alternativa, quantidade] of votos) {
    if (quantidade > melhor) {
      melhor = quantidade;
      consenso = alternativa;
    } else if (quantidade === melhor) {
      consenso = null;
    }
  }

  return { tipo: 'universitarios', opinioes, consenso: melhor >= 2 ? consenso : null };
}

/** Placas: a plateia levanta as placas e forma uma votação percentual. */
export function usarPlacas(
  pergunta: Pergunta,
  semente: number,
  eliminadas: IndiceAlternativa[] = [],
): ResultadoPlacas {
  const rng = criarRng(semente);
  const validas = ([0, 1, 2, 3] as IndiceAlternativa[]).filter((i) => !eliminadas.includes(i));
  const pesos: number[] = [0, 0, 0, 0];
  const plateiaAcerta = rng() < ACERTO_PLATEIA[pergunta.nivel];
  const favorita: IndiceAlternativa = plateiaAcerta
    ? pergunta.correta
    : escolher(rng, validas.filter((i) => i !== pergunta.correta).length > 0
        ? validas.filter((i) => i !== pergunta.correta)
        : validas);

  for (const i of validas) {
    pesos[i] = i === favorita ? inteiro(rng, 40, 70) : inteiro(rng, 5, 28);
  }

  const total = pesos.reduce((soma, p) => soma + p, 0);
  const percentuais = pesos.map((p) => Math.round((p / total) * 100)) as [
    number,
    number,
    number,
    number,
  ];

  // Ajusta o arredondamento para somar exatamente 100%.
  const diferenca = 100 - percentuais.reduce((soma, p) => soma + p, 0);
  percentuais[favorita] += diferenca;

  return { tipo: 'placas', percentuais };
}

/** Frases do apresentador para dar ritmo à partida. */
export function falaDoApresentador(rng: Rng, contexto: 'inicio' | 'acerto' | 'erro' | 'suspense' | 'parar'): string {
  const falas: Record<typeof contexto, string[]> = {
    inicio: [
      'Vamos começar! Boa sorte e muita calma nessa hora.',
      'A plateia está em silêncio. Preparado? Então vamos lá!',
      'Chegou a sua vez de tentar o milhão. Concentração total!',
    ],
    acerto: [
      'Acertou! Olha o dinheiro subindo aí na escada!',
      'Correto! A plateia vai à loucura!',
      'É isso aí! Você está voando nesse jogo!',
      'Perfeito! Mais um degrau rumo ao milhão.',
    ],
    erro: [
      'Que pena! Não era essa a resposta.',
      'Ihhh, essa não era. O jogo é duro mesmo.',
      'Infelizmente não. A resposta certa era outra.',
    ],
    suspense: [
      'Você tem certeza? Essa vale muito dinheiro...',
      'Vou conferir... a resposta é...',
      'Atenção, plateia! Silêncio absoluto!',
      'Pense bem. Ainda dá tempo de usar uma ajuda.',
    ],
    parar: [
      'Decisão de gente inteligente! Leva o dinheiro para casa.',
      'Parou na hora certa, hein! Parabéns pela coragem.',
      'Melhor um prêmio garantido do que um sonho arriscado.',
    ],
  };
  return escolher(rng, falas[contexto]);
}
