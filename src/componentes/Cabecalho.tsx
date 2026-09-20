import { useLoja } from '../estado/loja';
import { Logo } from './Logo';

interface Props {
  voltarPara?: Parameters<ReturnType<typeof useLoja.getState>['irPara']>[0];
  titulo?: string;
  acao?: React.ReactNode;
}

export function Cabecalho({ voltarPara = 'menu', titulo, acao }: Props) {
  const irPara = useLoja((e) => e.irPara);
  const perfil = useLoja((e) => e.perfil);

  return (
    <header className="cabecalho">
      <button
        className="botao botao-fantasma botao-pequeno"
        onClick={() => irPara(voltarPara)}
        aria-label="Voltar"
      >
        ← Voltar
      </button>
      {titulo ? <strong className="texto-ouro">{titulo}</strong> : <Logo compacto />}
      {acao ?? (
        <span className="etiqueta">
          {perfil?.avatar ?? '🙂'} {perfil?.nome ?? 'Participante'}
        </span>
      )}
    </header>
  );
}
