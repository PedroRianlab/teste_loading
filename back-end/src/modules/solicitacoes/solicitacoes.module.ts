import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SolicitacoesController } from './solicitacoes.controller';
import { SolicitacoesRepository } from './solicitacoes.repository';
import { SolicitacoesService } from './solicitacoes.service';

@Module({
  controllers: [SolicitacoesController],
  providers: [PrismaService, SolicitacoesRepository, SolicitacoesService],
})
export class SolicitacoesModule {}
