import { expirarSessao, lerToken } from '@/features/auth/sessao';

const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export class SessaoExpiradaError extends Error {
  constructor() {
    super('Sua sessão expirou. Entre novamente para continuar.');
  }
}

export async function api<T>(rota: string, opcoes: {
  metodo?: string;
  dados?: unknown;
  sinal?: AbortSignal;
  publico?: boolean;
} = {}): Promise<T> {
  const token = opcoes.publico ? null : lerToken();
  let resposta: Response;
  try {
    resposta = await fetch(base + rota, {
      method: opcoes.metodo,
      signal: opcoes.sinal,
      headers: {
        ...(opcoes.dados === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opcoes.dados === undefined ? undefined : JSON.stringify(opcoes.dados),
    });
  } catch (erro) {
    if (opcoes.sinal?.aborted) throw erro;
    throw new Error('Não foi possível conectar à API. Tente novamente.');
  }
  if (!resposta.ok) {
    if (resposta.status === 401 && !opcoes.publico) {
      expirarSessao(token);
      throw new SessaoExpiradaError();
    }
    const corpo = await resposta.json().catch(() => null);
    throw new Error(typeof corpo?.message === 'string' ? corpo.message : 'Não foi possível concluir a operação.');
  }
  return resposta.status === 204 ? undefined as T : resposta.json();
}
