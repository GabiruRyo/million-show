/**
 * Efeitos sonoros gerados em tempo real com a Web Audio API.
 * Nada de áudio original do programa é usado — tudo é sintetizado aqui.
 */

type Onda = OscillatorType;

let contexto: AudioContext | null = null;
let ganhoMestre: GainNode | null = null;
let loopSuspense: { parar: () => void } | null = null;
let habilitado = true;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!contexto) {
    const Construtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Construtor) return null;
    contexto = new Construtor();
    ganhoMestre = contexto.createGain();
    ganhoMestre.gain.value = 0.6;
    ganhoMestre.connect(contexto.destination);
  }
  if (contexto.state === 'suspended') void contexto.resume();
  return contexto;
}

export function configurarAudio(ligado: boolean, volume: number): void {
  habilitado = ligado;
  const c = ctx();
  if (c && ganhoMestre) ganhoMestre.gain.value = ligado ? volume : 0;
  if (!ligado) pararSuspense();
}

function nota(
  frequencia: number,
  inicio: number,
  duracao: number,
  onda: Onda = 'sine',
  volume = 0.25,
): void {
  const c = ctx();
  if (!c || !ganhoMestre || !habilitado) return;
  const osc = c.createOscillator();
  const ganho = c.createGain();
  osc.type = onda;
  osc.frequency.setValueAtTime(frequencia, c.currentTime + inicio);
  ganho.gain.setValueAtTime(0.0001, c.currentTime + inicio);
  ganho.gain.exponentialRampToValueAtTime(volume, c.currentTime + inicio + 0.02);
  ganho.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + inicio + duracao);
  osc.connect(ganho);
  ganho.connect(ganhoMestre);
  osc.start(c.currentTime + inicio);
  osc.stop(c.currentTime + inicio + duracao + 0.05);
}

function ruido(inicio: number, duracao: number, volume = 0.15): void {
  const c = ctx();
  if (!c || !ganhoMestre || !habilitado) return;
  const amostras = Math.floor(c.sampleRate * duracao);
  const buffer = c.createBuffer(1, amostras, c.sampleRate);
  const dados = buffer.getChannelData(0);
  for (let i = 0; i < amostras; i++) dados[i] = (Math.random() * 2 - 1) * (1 - i / amostras);
  const fonte = c.createBufferSource();
  const ganho = c.createGain();
  ganho.gain.value = volume;
  fonte.buffer = buffer;
  fonte.connect(ganho);
  ganho.connect(ganhoMestre);
  fonte.start(c.currentTime + inicio);
}

export const som = {
  clique(): void {
    nota(520, 0, 0.06, 'triangle', 0.12);
  },
  selecionar(): void {
    nota(440, 0, 0.09, 'square', 0.1);
    nota(660, 0.05, 0.1, 'square', 0.08);
  },
  confirmar(): void {
    nota(330, 0, 0.12, 'sawtooth', 0.12);
    nota(392, 0.1, 0.16, 'sawtooth', 0.12);
  },
  acerto(): void {
    const acorde = [523.25, 659.25, 783.99, 1046.5];
    acorde.forEach((f, i) => nota(f, i * 0.08, 0.5, 'triangle', 0.2));
  },
  erro(): void {
    nota(196, 0, 0.5, 'sawtooth', 0.22);
    nota(185, 0.12, 0.6, 'square', 0.16);
    ruido(0, 0.3, 0.1);
  },
  ajuda(): void {
    nota(880, 0, 0.1, 'sine', 0.14);
    nota(1174, 0.08, 0.14, 'sine', 0.12);
  },
  tempo(): void {
    nota(1200, 0, 0.05, 'square', 0.1);
  },
  parar(): void {
    [392, 523.25, 659.25].forEach((f, i) => nota(f, i * 0.12, 0.35, 'sine', 0.18));
  },
  fanfarra(): void {
    const melodia: [number, number][] = [
      [523.25, 0], [659.25, 0.16], [783.99, 0.32], [1046.5, 0.48],
      [783.99, 0.7], [1046.5, 0.86], [1318.5, 1.1],
    ];
    for (const [f, t] of melodia) nota(f, t, 0.45, 'triangle', 0.22);
    for (const [f, t] of melodia) nota(f / 2, t, 0.5, 'sine', 0.12);
  },
  /** Batida de tensão que fica em loop enquanto a resposta não é revelada. */
  suspense(): void {
    pararSuspense();
    const c = ctx();
    if (!c || !habilitado) return;
    let ativo = true;
    let passo = 0;
    const bater = () => {
      if (!ativo) return;
      const base = passo % 2 === 0 ? 110 : 146.83;
      nota(base, 0, 0.35, 'sine', 0.2);
      nota(base * 2, 0, 0.18, 'triangle', 0.06);
      passo++;
      temporizador = window.setTimeout(bater, 620);
    };
    let temporizador = window.setTimeout(bater, 0);
    loopSuspense = {
      parar: () => {
        ativo = false;
        window.clearTimeout(temporizador);
      },
    };
  },
};

export function pararSuspense(): void {
  loopSuspense?.parar();
  loopSuspense = null;
}
