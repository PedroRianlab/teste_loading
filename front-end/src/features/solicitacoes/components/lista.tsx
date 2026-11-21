'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Aviso } from '@/ui/aviso';
import { estados, prioridades, type Solicitacao } from '../types/solicitacao';
import { SeloPrioridade, SeloStatus } from './selos';

export function Lista() {
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [prioridade, setPrioridade] = useState('');
  const [ordenacao, setOrdenacao] = useState('criadaEm:desc');
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState<{ chave: string; itens?: Solicitacao[]; erro?: string }>();
  const [ordenarPor, ordem] = ordenacao.split(':');
  const query = new URLSearchParams({ ordenarPor, ordem });
  if (busca.trim()) query.set('busca', busca.trim());
  if (status) query.set('status', status);
  if (prioridade) query.set('prioridade', prioridade);
  const rota = '/solicitacoes?' + query;
  const chave = rota + '#' + tentativa;

  useEffect(() => {
    const controle = new AbortController();
    const timer = window.setTimeout(() => {
      api<Solicitacao[]>(rota, { sinal: controle.signal })
        .then((itens) => { if (!controle.signal.aborted) setResultado({ chave, itens }); })
        .catch((erro: Error) => { if (!controle.signal.aborted) setResultado({ chave, erro: erro.message }); });
    }, 180);
    return () => { window.clearTimeout(timer); controle.abort(); };
  }, [rota, chave]);

  const atual = resultado?.chave === chave ? resultado : undefined;
  return <>
    <div className="page-header">
      <h1>Solicitações</h1>
      <Link className="button primary" href="/solicitacoes/nova">+ Nova solicitação</Link>
    </div>
    <div className="filters">
      <label>Buscar<input type="search" placeholder="Buscar por título ou descrição" value={busca} maxLength={200} onChange={(e) => setBusca(e.target.value)} /></label>
      <div className="field"><label htmlFor="filtro-status">Status</label><select id="filtro-status" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Todos</option>
        {Object.entries(estados).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
      </select></div>
      <div className="field"><label htmlFor="filtro-prioridade">Prioridade</label><select id="filtro-prioridade" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
        <option value="">Todas</option>
        {Object.entries(prioridades).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
      </select></div>
      <div className="field"><label htmlFor="filtro-ordenacao">Ordenação</label><select id="filtro-ordenacao" value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)}>
        <option value="criadaEm:desc">Mais recentes</option>
        <option value="criadaEm:asc">Mais antigas</option>
        <option value="prioridade:desc">Prioridade mais alta</option>
        <option value="prioridade:asc">Prioridade mais baixa</option>
        <option value="titulo:asc">Título A–Z</option>
      </select></div>
    </div>
    {!atual && <p className="panel empty" role="status">Carregando solicitações…</p>}
    {atual?.erro && <div className="panel stack"><Aviso mensagem={atual.erro} /><button className="button" onClick={() => setTentativa(tentativa + 1)}>Tentar novamente</button></div>}
    {atual?.itens?.length === 0 && <p className="panel empty">Nenhuma solicitação encontrada.</p>}
    {!!atual?.itens?.length && <div className="table-wrap panel" role="region" aria-label="Solicitações" tabIndex={0}>
      <table>
        <thead><tr><th scope="col">Título</th><th scope="col">Categoria</th><th scope="col">Prioridade</th><th scope="col">Status</th></tr></thead>
        <tbody>{atual.itens.map((item) => <tr key={item.id}>
          <td><Link className="table-link" href={`/solicitacoes/${item.id}`}>{item.titulo}</Link></td>
          <td>{item.categoria}</td><td><SeloPrioridade prioridade={item.prioridade} /></td><td><SeloStatus status={item.status} /></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </>;
}
