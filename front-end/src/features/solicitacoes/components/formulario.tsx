'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api, SessaoExpiradaError } from '@/lib/api';
import { Aviso } from '@/ui/aviso';
import { lerFormulario } from '../schemas/formulario';
import { prioridades, type Solicitacao } from '../types/solicitacao';
import { useSolicitacao } from './use-solicitacao';

export function Formulario({ id }: { id?: string }) {
  const router = useRouter();
  const { resultado } = useSolicitacao(id);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const voltar = id ? `/solicitacoes/${encodeURIComponent(id)}` : '/solicitacoes';
  const item = resultado?.item;

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro('');
    setOcupado(true);
    try {
      const dados = lerFormulario(evento.currentTarget);
      const salvo = await api<Solicitacao>(id ? voltar : '/solicitacoes', { metodo: id ? 'PATCH' : 'POST', dados });
      router.push(`/solicitacoes/${salvo.id}`);
    } catch (erro) {
      if (!(erro instanceof SessaoExpiradaError)) setErro((erro as Error).message);
      setOcupado(false);
    }
  }

  return <div className="form-page">
    <Link className="back" href={voltar}>← Voltar</Link>
    <h1>{id ? 'Editar solicitação' : 'Nova solicitação'}</h1>
    {id && !resultado && <p role="status">Carregando solicitação…</p>}
    {resultado?.erro && <Aviso mensagem={resultado.erro} />}
    {(!id || item) && <form className="panel stack" onSubmit={enviar}>
      {erro && <Aviso mensagem={erro} />}
      <label>Título<input name="titulo" required defaultValue={item?.titulo} placeholder="Informe um título para a solicitação" /></label>
      <label>Descrição<textarea name="descricao" required rows={5} defaultValue={item?.descricao} placeholder="Descreva a solicitação" /></label>
      <div className="form-grid">
        <label>Categoria<input name="categoria" required defaultValue={item?.categoria} placeholder="Ex.: Infraestrutura" /></label>
        <div className="field"><label htmlFor="form-prioridade">Prioridade</label><select id="form-prioridade" name="prioridade" required defaultValue={item?.prioridade ?? ''}>
          <option value="" disabled>Selecione a prioridade</option>
          {Object.entries(prioridades).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
        </select></div>
      </div>
      <div className="actions">
        <Link className="button" href={voltar}>Cancelar</Link>
        <button className="button primary" disabled={ocupado}>{ocupado ? 'Salvando…' : id ? 'Salvar alterações' : 'Criar solicitação'}</button>
      </div>
    </form>}
  </div>;
}
