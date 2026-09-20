import { formatarReais } from '../dados/premios';
import { reaisPorExtenso } from '../utilitarios/extenso';
import { dataBrasileira } from '../utilitarios/extenso';

interface Props {
  valor: number;
  nome: string;
}

export function ChequePremiado({ valor, nome }: Props) {
  return (
    <div className="cheque">
      <div className="titulo">
        <span>Banco do Milhão S.A.</span>
        <span>Agência 1000 · Conta 00.000-1</span>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: '0.9rem' }}>
        Pague por este cheque a quantia de
      </p>
      <div className="valor">{formatarReais(valor)}</div>
      <div className="extenso">({reaisPorExtenso(valor)})</div>
      <p style={{ marginTop: 16, fontSize: '0.95rem' }}>
        A <strong>{nome}</strong> ou à sua ordem.
      </p>
      <div className="assinatura">
        <span>São Paulo, {dataBrasileira(Date.now())}</span>
        <span className="linha-assinatura">Diretoria do programa</span>
      </div>
    </div>
  );
}
