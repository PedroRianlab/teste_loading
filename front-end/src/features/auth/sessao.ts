const CHAVE = 'central-solicitacoes.token';
const EVENTO = 'central-solicitacoes:sessao';

export function lerToken() {
  return sessionStorage.getItem(CHAVE);
}

export function salvarToken(token: string | null) {
  if (token) sessionStorage.setItem(CHAVE, token);
  else sessionStorage.removeItem(CHAVE);
  window.dispatchEvent(new Event(EVENTO));
}

export function observarSessao(notificar: () => void) {
  window.addEventListener(EVENTO, notificar);
  return () => window.removeEventListener(EVENTO, notificar);
}
