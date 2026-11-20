import { Injectable } from '@nestjs/common';
import { Prioridade, Prisma, StatusSolicitacao } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SolicitacoesRepository {
  constructor(private readonly prisma: PrismaService) {}

  criar(data: Prisma.SolicitacaoCreateInput) {
    return this.prisma.solicitacao.create({ data });
  }

  listar(filtros: { status?: StatusSolicitacao; prioridade?: Prioridade }) {
    return this.prisma.solicitacao.findMany({ where: filtros, orderBy: { criadaEm: 'desc' } });
  }

  buscar(id: string) {
    return this.prisma.solicitacao.findUnique({ where: { id } });
  }

  atualizar(id: string, data: Prisma.SolicitacaoUpdateInput) {
    return this.prisma.solicitacao.updateMany({ where: { id }, data });
  }

  alterarStatus(id: string, anterior: StatusSolicitacao, proximo: StatusSolicitacao) {
    return this.prisma.solicitacao.updateMany({
      where: { id, status: anterior },
      data: { status: proximo },
    });
  }

  excluir(id: string) {
    return this.prisma.solicitacao.deleteMany({ where: { id } });
  }
}
