import { Injectable } from '@nestjs/common';
import { Prioridade, Prisma, StatusSolicitacao } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type OpcoesListagem = {
  status?: StatusSolicitacao;
  prioridade?: Prioridade;
  busca?: string;
  ordenarPor?: 'criadaEm' | 'prioridade' | 'titulo';
  ordem?: 'asc' | 'desc';
};

@Injectable()
export class SolicitacoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  criar(data: Prisma.SolicitacaoCreateInput) {
    return this.prisma.solicitacao.create({ data });
  }

  listar({ busca, ordenarPor = 'criadaEm', ordem = 'desc', ...filtros }: OpcoesListagem) {
    const texto = busca ? { contains: busca.replace(/[\\%_]/g, '\\$&'), mode: 'insensitive' as const } : undefined;
    return this.prisma.solicitacao.findMany({
      where: { ...filtros, OR: texto ? [{ titulo: texto }, { descricao: texto }] : undefined },
      orderBy: [{ [ordenarPor]: ordem }, { id: 'asc' }],
    });
  }

  buscar(id: string) {
    return this.prisma.solicitacao.findUnique({
      where: { id },
      include: { historico: { orderBy: { id: 'asc' } } },
    });
  }

  atualizar(id: string, data: Prisma.SolicitacaoUpdateInput) {
    return this.prisma.solicitacao.updateMany({ where: { id }, data });
  }

  alterarStatus(id: string, anterior: StatusSolicitacao, proximo: StatusSolicitacao) {
    return this.prisma.$transaction(async (tx) => {
      const resultado = await tx.solicitacao.updateMany({
        where: { id, status: anterior },
        data: { status: proximo },
      });
      if (resultado.count) {
        await tx.mudancaStatus.create({ data: { solicitacaoId: id, anterior, novo: proximo } });
      }
      return resultado;
    });
  }

  excluir(id: string) {
    return this.prisma.solicitacao.deleteMany({ where: { id } });
  }
}
