import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../prisma/prisma.service';
import { SolicitacoesController } from './solicitacoes.controller';
import { SolicitacoesRepository } from './solicitacoes.repository';
import { SolicitacoesService } from './solicitacoes.service';

@Module({
  imports: [AuthModule],
  controllers: [SolicitacoesController],
  providers: [PrismaService, SolicitacoesRepository, SolicitacoesService],
})
export class SolicitacoesModule {}
