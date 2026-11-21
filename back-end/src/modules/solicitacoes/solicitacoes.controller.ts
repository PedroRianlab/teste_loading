import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prioridade, StatusSolicitacao } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { SolicitacoesService } from './solicitacoes.service';

const camposSolicitacao = {
  titulo: { type: 'string', example: 'Acesso à impressora' },
  descricao: { type: 'string', example: 'Preciso acessar a impressora do setor.' },
  categoria: { type: 'string', example: 'Infraestrutura' },
  prioridade: { type: 'string', enum: Object.values(Prioridade), example: Prioridade.MEDIA },
};

@Controller('solicitacoes')
@UseGuards(AuthGuard)
@ApiTags('Solicitações')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente ou inválido.', schema: {
  example: { statusCode: 401, message: 'Informe um token de acesso válido.', error: 'Unauthorized' },
} })
export class SolicitacoesController {
  constructor(private readonly service: SolicitacoesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar solicitação com status ABERTA' })
  @ApiResponse({ status: 201, description: 'Solicitação criada.' })
  @ApiBody({ schema: { type: 'object', properties: camposSolicitacao, required: Object.keys(camposSolicitacao) } })
  @ApiResponse({ status: 400, description: 'Campos obrigatórios ausentes ou inválidos.', schema: {
    example: { statusCode: 400, message: 'O campo titulo é obrigatório e não pode estar vazio.', error: 'Bad Request' },
  } })
  criar(@Body() dados: unknown) { return this.service.criar(dados); }

  @Get()
  @ApiOperation({ summary: 'Listar solicitações' })
  @ApiResponse({ status: 200, description: 'Lista de solicitações.' })
  @ApiQuery({ name: 'status', enum: StatusSolicitacao, required: false })
  @ApiQuery({ name: 'prioridade', enum: Prioridade, required: false })
  @ApiQuery({ name: 'busca', required: false, schema: { type: 'string', maxLength: 200 }, description: 'Trecho do título ou descrição.' })
  @ApiQuery({ name: 'ordenarPor', required: false, schema: { type: 'string', enum: ['criadaEm', 'prioridade', 'titulo'], default: 'criadaEm' } })
  @ApiQuery({ name: 'ordem', required: false, schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } })
  @ApiResponse({ status: 400, description: 'Filtro ou ordenação inválidos.' })
  listar(@Query() filtros: Record<string, unknown>) { return this.service.listar(filtros); }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar solicitação e histórico de status' })
  @ApiResponse({ status: 200, description: 'Solicitação com histórico.' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada.' })
  buscar(@Param('id') id: string) { return this.service.buscar(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar os dados da solicitação' })
  @ApiResponse({ status: 200, description: 'Solicitação atualizada.' })
  @ApiBody({ schema: { type: 'object', properties: camposSolicitacao, minProperties: 1 } })
  @ApiResponse({ status: 400, description: 'Campos inválidos ou corpo vazio.' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada.' })
  atualizar(@Param('id') id: string, @Body() dados: unknown) { return this.service.atualizar(id, dados); }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Avançar status', description: 'Fluxo permitido: ABERTA → EM_ANDAMENTO → CONCLUIDA.' })
  @ApiResponse({ status: 200, description: 'Status atualizado.' })
  @ApiBody({ schema: { type: 'object', required: ['status'], properties: {
    status: { type: 'string', enum: [StatusSolicitacao.EM_ANDAMENTO, StatusSolicitacao.CONCLUIDA], example: StatusSolicitacao.EM_ANDAMENTO },
  } } })
  @ApiResponse({ status: 400, description: 'Status inválido ou transição fora da sequência.' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada.' })
  @ApiResponse({ status: 409, description: 'A solicitação mudou durante a operação.' })
  alterarStatus(@Param('id') id: string, @Body() dados: unknown) { return this.service.alterarStatus(id, dados); }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir solicitação e histórico' })
  @ApiResponse({ status: 204, description: 'Solicitação excluída.' })
  @ApiResponse({ status: 404, description: 'Solicitação não encontrada.' })
  excluir(@Param('id') id: string) { return this.service.excluir(id); }
}
