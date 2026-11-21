import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { SolicitacoesController } from './solicitacoes.controller';
import { SolicitacoesRepository } from './solicitacoes.repository';
import { SolicitacoesService } from './solicitacoes.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [SolicitacoesController],
  providers: [SolicitacoesRepository, SolicitacoesService],
})
export class SolicitacoesModule {}
