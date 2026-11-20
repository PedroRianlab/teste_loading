import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { SolicitacoesService } from './solicitacoes.service';

@Controller('solicitacoes')
export class SolicitacoesController {
  constructor(private readonly service: SolicitacoesService) {}

  @Post()
  criar(@Body() dados: unknown) { return this.service.criar(dados); }

  @Get()
  listar(@Query() filtros: Record<string, unknown>) { return this.service.listar(filtros); }

  @Get(':id')
  buscar(@Param('id') id: string) { return this.service.buscar(id); }

  @Patch(':id')
  atualizar(@Param('id') id: string, @Body() dados: unknown) { return this.service.atualizar(id, dados); }

  @Patch(':id/status')
  alterarStatus(@Param('id') id: string, @Body() dados: unknown) { return this.service.alterarStatus(id, dados); }

  @Delete(':id')
  @HttpCode(204)
  excluir(@Param('id') id: string) { return this.service.excluir(id); }
}
