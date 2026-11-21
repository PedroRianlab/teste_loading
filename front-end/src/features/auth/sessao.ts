import { useSyncExternalStore } from 'react';

const CHAVE_TOKEN = 'central-solicitacoes.token';
const CHAVE_USUARIO = 'central-solicitacoes.usuario';
const EVENTO = 'central-solicitacoes:sessao';

export function lerToken() {
  return sessionStorage.getItem(CHAVE_TOKEN);
}

function lerUsuario() {
  return sessionStorage.getItem(CHAVE_USUARIO);
}

export function iniciarSessao(token: string, usuario: string) {
  sessionStorage.setItem(CHAVE_USUARIO, usuario.trim().toLowerCase());
  sessionStorage.setItem(CHAVE_TOKEN, token);
  window.dispatchEvent(new Event(EVENTO));
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE_TOKEN);
  sessionStorage.removeItem(CHAVE_USUARIO);
  window.dispatchEvent(new Event(EVENTO));
}

export function expirarSessao(token: string | null) {
  if (!token || token !== lerToken()) return;

  sessionStorage.removeItem(CHAVE_TOKEN);
  window.dispatchEvent(new Event(EVENTO));
}

function observarSessao(notificar: () => void) {
  window.addEventListener(EVENTO, notificar);
  return () => window.removeEventListener(EVENTO, notificar);
}

export function useToken() {
  return useSyncExternalStore<string | null | undefined>(observarSessao, lerToken, () => undefined);
}

export function useUsuario() {
  return useSyncExternalStore(observarSessao, lerUsuario, () => null);
}
