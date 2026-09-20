const UNIDADES = [
  '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete',
  'dezoito', 'dezenove',
];
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const CENTENAS = [
  '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos',
  'setecentos', 'oitocentos', 'novecentos',
];

function ateNovecentos(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';
  const partes: string[] = [];
  const centena = Math.floor(n / 100);
  const resto = n % 100;
  if (centena > 0) partes.push(CENTENAS[centena]);
  if (resto > 0) {
    if (resto < 20) partes.push(UNIDADES[resto]);
    else {
      const dezena = Math.floor(resto / 10);
      const unidade = resto % 10;
      partes.push(unidade > 0 ? `${DEZENAS[dezena]} e ${UNIDADES[unidade]}` : DEZENAS[dezena]);
    }
  }
  return partes.join(' e ');
}

/** Escreve um valor em reais por extenso — usado no cheque premiado. */
export function reaisPorExtenso(valor: number): string {
  if (valor <= 0) return 'zero real';
  const milhoes = Math.floor(valor / 1_000_000);
  const milhares = Math.floor((valor % 1_000_000) / 1000);
  const unidades = valor % 1000;

  const partes: string[] = [];
  if (milhoes > 0) partes.push(milhoes === 1 ? 'um milhão' : `${ateNovecentos(milhoes)} milhões`);
  if (milhares > 0) partes.push(milhares === 1 ? 'mil' : `${ateNovecentos(milhares)} mil`);
  if (unidades > 0) partes.push(ateNovecentos(unidades));

  const texto = partes.join(partes.length > 1 && unidades > 0 && unidades < 100 ? ' e ' : ' e ');
  return `${texto} ${valor === 1 ? 'real' : 'reais'}`;
}

export function dataBrasileira(ms: number): string {
  return new Date(ms).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function horaBrasileira(ms: number): string {
  return new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** Remove acentos e pontuação para comparar textos (busca e detecção de duplicatas). */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
