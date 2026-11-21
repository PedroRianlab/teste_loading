import { useEffect, useState } from 'react';
import { useToken } from '@/features/auth/sessao';
import { api, SessaoExpiradaError } from '@/lib/api';
import type { SolicitacaoDetalhada } from '../types/solicitacao';

export function useSolicitacao(id?: string) {
  const token = useToken();
  const [resultado, setResultado] = useState<{ id: string; item?: SolicitacaoDetalhada; erro?: string }>();
  const itemCarregado = resultado?.item?.id === id && Boolean(resultado?.item);
  useEffect(() => {
    if (!id || !token || itemCarregado) return;
    const controle = new AbortController();
    api<SolicitacaoDetalhada>(`/solicitacoes/${encodeURIComponent(id)}`, { sinal: controle.signal })
      .then((item) => { if (!controle.signal.aborted) setResultado({ id, item }); })
      .catch((erro: Error) => {
        if (!controle.signal.aborted && !(erro instanceof SessaoExpiradaError)) {
          setResultado({ id, erro: erro.message });
        }
      });
    return () => controle.abort();
  }, [id, token, itemCarregado]);

  return {
    resultado: resultado?.id === id ? resultado : undefined,
    atualizar: (item: SolicitacaoDetalhada) => setResultado({ id: item.id, item }),
  };
}
