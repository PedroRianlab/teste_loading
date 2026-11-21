import { estados, prioridades, type Status, type Prioridade } from '../types/solicitacao';

export function SeloStatus({ status }: { status: Status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{estados[status]}</span>;
}

export function SeloPrioridade({ prioridade }: { prioridade: Prioridade }) {
  return <span className={`badge badge-${prioridade.toLowerCase()}`}>{prioridades[prioridade]}</span>;
}
