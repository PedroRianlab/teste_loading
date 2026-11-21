import { prioridades, type DadosSolicitacao, type Prioridade } from '../types/solicitacao';

export function lerFormulario(form: HTMLFormElement): DadosSolicitacao {
  const dados = new FormData(form);
  const titulo = String(dados.get('titulo') ?? '').trim();
  const descricao = String(dados.get('descricao') ?? '').trim();
  const categoria = String(dados.get('categoria') ?? '').trim();
  const prioridade = String(dados.get('prioridade') ?? '');

  if (!titulo || !descricao || !categoria) throw new Error('Preencha título, descrição e categoria.');
  if (!Object.hasOwn(prioridades, prioridade)) throw new Error('Selecione uma prioridade.');
  return { titulo, descricao, categoria, prioridade: prioridade as Prioridade };
}
