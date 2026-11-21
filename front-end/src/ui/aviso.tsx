export function Aviso({ mensagem }: { mensagem: string }) {
  return <p className="aviso" role="alert">{mensagem}</p>;
}
