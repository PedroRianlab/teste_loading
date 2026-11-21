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

const incluirHistorico = {
  historico: { orderBy: { id: 'asc' } },
} satisfies Prisma.SolicitacaoInclude;

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
      include: incluirHistorico,
    });
  }

  atualizar(id: string, data: Prisma.SolicitacaoUpdateInput) {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.solicitacao.updateMany({ where: { id }, data });
      if (!count) return null;

      return tx.solicitacao.findUniqueOrThrow({ where: { id }, include: incluirHistorico });
    });
  }

  alterarStatus(id: string, anterior: StatusSolicitacao, proximo: StatusSolicitacao) {
    return this.prisma.$transaction(async (tx) => {
      const resultado = await tx.solicitacao.updateMany({
        where: { id, status: anterior },
        data: { status: proximo },
      });
      if (!resultado.count) return null;

      await tx.mudancaStatus.create({ data: { solicitacaoId: id, anterior, novo: proximo } });
      return tx.solicitacao.findUniqueOrThrow({ where: { id }, include: incluirHistorico });
    });
  }

  excluir(id: string) {
    return this.prisma.solicitacao.deleteMany({ where: { id } });
  }
}
