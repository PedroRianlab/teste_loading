import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SolicitacaoDetalhada } from '../types/solicitacao';

export function useSolicitacao(id?: string) {
  const [resultado, setResultado] = useState<{ id: string; item?: SolicitacaoDetalhada; erro?: string }>();
  useEffect(() => {
    if (!id) return;
    const controle = new AbortController();
    api<SolicitacaoDetalhada>(`/solicitacoes/${encodeURIComponent(id)}`, { sinal: controle.signal })
      .then((item) => { if (!controle.signal.aborted) setResultado({ id, item }); })
      .catch((erro: Error) => { if (!controle.signal.aborted) setResultado({ id, erro: erro.message }); });
    return () => controle.abort();
  }, [id]);

  return {
    resultado: resultado?.id === id ? resultado : undefined,
    atualizar: (item: SolicitacaoDetalhada) => setResultado({ id: item.id, item }),
  };
}
