'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { api, SessaoExpiradaError } from '@/lib/api';
import { Aviso } from '@/ui/aviso';
import { estados, type SolicitacaoDetalhada } from '../types/solicitacao';
import { SeloPrioridade, SeloStatus } from './selos';
import { useSolicitacao } from './use-solicitacao';

const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

export function Detalhe({ id }: { id: string }) {
  const router = useRouter();
  const { resultado, atualizar } = useSolicitacao(id);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const dialogo = useRef<HTMLDialogElement>(null);
  const rota = `/solicitacoes/${encodeURIComponent(id)}`;
  const item = resultado?.item;
  const proximo = item?.status === 'ABERTA' ? 'EM_ANDAMENTO' : item?.status === 'EM_ANDAMENTO' ? 'CONCLUIDA' : null;

  async function avancar() {
    if (!proximo) return;
    setErro('');
    setOcupado(true);
    try {
      atualizar(await api<SolicitacaoDetalhada>(rota + '/status', { metodo: 'PATCH', dados: { status: proximo } }));
    } catch (erro) {
      if (!(erro instanceof SessaoExpiradaError)) setErro((erro as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  async function excluir() {
    dialogo.current?.close();
    setErro('');
    setOcupado(true);
    try {
      await api(rota, { metodo: 'DELETE' });
      router.replace('/solicitacoes');
    } catch (erro) {
      if (!(erro instanceof SessaoExpiradaError)) setErro((erro as Error).message);
      setOcupado(false);
    }
  }

  return <div className="stack">
    <Link className="back" href="/solicitacoes">← Voltar</Link>
    {!resultado && <p role="status">Carregando solicitação…</p>}
    {resultado?.erro && <Aviso mensagem={resultado.erro} />}
    {item && <>
      <div className="page-header detail-header">
        <div className="title-group"><h1>{item.titulo}</h1><SeloStatus status={item.status} /></div>
        <div className="actions">
          <Link className="button" href={rota + '/editar'}>Editar</Link>
          <button className="button danger" disabled={ocupado} onClick={() => dialogo.current?.showModal()}>Excluir</button>
          {proximo && <button className="button primary" disabled={ocupado} onClick={avancar}>{proximo === 'EM_ANDAMENTO' ? 'Iniciar atendimento' : 'Concluir solicitação'}</button>}
        </div>
      </div>
      {erro && <Aviso mensagem={erro} />}
      <section className="panel">
        <dl className="form-grid"><div><dt>Categoria</dt><dd>{item.categoria}</dd></div><div><dt>Prioridade</dt><dd><SeloPrioridade prioridade={item.prioridade} /></dd></div></dl>
        <div className="descricao"><h2>Descrição</h2><p>{item.descricao}</p></div>
      </section>
      <section className="panel">
        <h2>Histórico de status</h2>
        <ol className="timeline">
          <li><strong>Aberta</strong><span>{dataHora.format(new Date(item.criadaEm))} · Solicitação criada</span></li>
          {item.historico.map((mudanca) => <li key={mudanca.id}><strong>{estados[mudanca.anterior]} → {estados[mudanca.novo]}</strong><span>{dataHora.format(new Date(mudanca.alteradaEm))}</span></li>)}
        </ol>
      </section>
      <dialog ref={dialogo} className="panel" aria-labelledby="titulo-excluir">
        <h2 id="titulo-excluir">Excluir solicitação?</h2>
        <p>A solicitação e seu histórico serão removidos.</p>
        <div className="actions">
          <button className="button" onClick={() => dialogo.current?.close()} autoFocus>Cancelar</button>
          <button className="button danger" onClick={excluir}>Excluir solicitação</button>
        </div>
      </dialog>
    </>}
  </div>;
}
