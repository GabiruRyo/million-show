interface Props {
  compacto?: boolean;
}

export function Logo({ compacto = false }: Props) {
  if (compacto) {
    return (
      <span className="marca">
        <span>🏆</span>
        <span className="texto-ouro">SHOW DO MILHÃO</span>
      </span>
    );
  }
  return (
    <div className="logo">
      <div className="linha1">Show do</div>
      <div className="linha2 texto-ouro">Milhão</div>
      <div className="cifra">R$ 1.000.000,00</div>
    </div>
  );
}
