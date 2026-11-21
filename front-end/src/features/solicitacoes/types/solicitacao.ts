export const prioridades = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta' } as const;
export const estados = { ABERTA: 'Aberta', EM_ANDAMENTO: 'Em andamento', CONCLUIDA: 'Concluída' } as const;

export type Prioridade = keyof typeof prioridades;
export type Status = keyof typeof estados;
export type DadosSolicitacao = { titulo: string; descricao: string; categoria: string; prioridade: Prioridade };
export type Solicitacao = DadosSolicitacao & { id: string; status: Status; criadaEm: string; atualizadaEm: string };
export type SolicitacaoDetalhada = Solicitacao & {
  historico: { id: number; anterior: Status; novo: Status; alteradaEm: string }[];
};
