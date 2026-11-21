import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prioridade, StatusSolicitacao } from '@prisma/client';
import { OpcoesListagem, SolicitacoesRepository } from './solicitacoes.repository';

type DadosSolicitacao = { titulo: string; descricao: string; categoria: string; prioridade: Prioridade };

@Injectable()
export class SolicitacoesService {
  constructor(private readonly repository: SolicitacoesRepository) {}

  private objeto(valor: unknown): Record<string, unknown> {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
      throw new BadRequestException('Envie um objeto JSON v?lido.');
    }
    return valor as Record<string, unknown>;
  }

  private validarDados(valor: unknown, parcial = false): Partial<DadosSolicitacao> {
    const dados = this.objeto(valor);
    const permitidos = ['titulo', 'descricao', 'categoria', 'prioridade'];
    if (Object.keys(dados).some((chave) => !permitidos.includes(chave))) {
      throw new BadRequestException('H? campos n?o permitidos na solicita??o.');
    }
    if (parcial && Object.keys(dados).length === 0) {
      throw new BadRequestException('Informe ao menos um campo para atualizar.');
    }
    const resultado: Partial<DadosSolicitacao> = {};
    for (const campo of ['titulo', 'descricao', 'categoria'] as const) {
      if (parcial && !(campo in dados)) continue;
      const texto = dados[campo];
      if (typeof texto !== 'string' || !texto.trim()) {
        throw new BadRequestException(`O campo ${campo} ? obrigat?rio e n?o pode estar vazio.`);
      }
      resultado[campo] = texto.trim();
    }
    if (!parcial || 'prioridade' in dados) {
      if (!Object.values(Prioridade).includes(dados.prioridade as Prioridade)) {
        throw new BadRequestException('Prioridade deve ser BAIXA, MEDIA ou ALTA.');
      }
      resultado.prioridade = dados.prioridade as Prioridade;
    }
    return resultado;
  }

  criar(dados: unknown) {
    return this.repository.criar(this.validarDados(dados) as DadosSolicitacao);
  }

  listar(filtros: Record<string, unknown>) {
    if (Object.keys(filtros).some((campo) => !['status', 'prioridade', 'busca', 'ordenarPor', 'ordem'].includes(campo))) {
      throw new BadRequestException('Parâmetros permitidos: status, prioridade, busca, ordenarPor e ordem.');
    }
    if (filtros.status !== undefined && !Object.values(StatusSolicitacao).includes(filtros.status as StatusSolicitacao)) {
      throw new BadRequestException('Status deve ser ABERTA, EM_ANDAMENTO ou CONCLUIDA.');
    }
    if (filtros.prioridade !== undefined && !Object.values(Prioridade).includes(filtros.prioridade as Prioridade)) {
      throw new BadRequestException('Prioridade deve ser BAIXA, MEDIA ou ALTA.');
    }
    const { busca, ordenarPor, ordem } = filtros;
    if (busca !== undefined && (typeof busca !== 'string' || busca.length > 200 || busca.includes('\0'))) {
      throw new BadRequestException('Busca deve ser um texto de até 200 caracteres.');
    }
    if (ordenarPor !== undefined && ordenarPor !== 'criadaEm' && ordenarPor !== 'prioridade' && ordenarPor !== 'titulo') {
      throw new BadRequestException('Ordene por criadaEm, prioridade ou titulo.');
    }
    if (ordem !== undefined && ordem !== 'asc' && ordem !== 'desc') {
      throw new BadRequestException('Ordem deve ser asc ou desc.');
    }
    const opcoes = filtros as OpcoesListagem;
    return this.repository.listar(busca === undefined ? opcoes : { ...opcoes, busca: busca.trim() });
  }

  async buscar(id: string) {
    const solicitacao = await this.repository.buscar(id);
    if (!solicitacao) throw new NotFoundException('Solicita??o n?o encontrada.');
    return solicitacao;
  }

  async atualizar(id: string, dados: unknown) {
    const atualizacao = this.validarDados(dados, true);
    const resultado = await this.repository.atualizar(id, atualizacao);
    if (!resultado.count) throw new NotFoundException('Solicita??o n?o encontrada.');
    return this.buscar(id);
  }

  async alterarStatus(id: string, corpo: unknown) {
    const dados = this.objeto(corpo);
    if (Object.keys(dados).length !== 1 || !Object.values(StatusSolicitacao).includes(dados.status as StatusSolicitacao)) {
      throw new BadRequestException('Informe apenas um status v?lido: ABERTA, EM_ANDAMENTO ou CONCLUIDA.');
    }
    const atual = await this.buscar(id);
    const proximo = dados.status as StatusSolicitacao;
    const transicoes: Partial<Record<StatusSolicitacao, StatusSolicitacao>> = {
      ABERTA: StatusSolicitacao.EM_ANDAMENTO,
      EM_ANDAMENTO: StatusSolicitacao.CONCLUIDA,
    };
    if (transicoes[atual.status] !== proximo) {
      throw new BadRequestException('Transi??o inv?lida. O fluxo ? ABERTA ? EM_ANDAMENTO ? CONCLUIDA.');
    }
    const resultado = await this.repository.alterarStatus(id, atual.status, proximo);
    if (!resultado.count) throw new ConflictException('A solicita??o foi alterada ou removida. Consulte-a novamente.');
    return this.buscar(id);
  }

  async excluir(id: string) {
    const resultado = await this.repository.excluir(id);
    if (!resultado.count) throw new NotFoundException('Solicita??o n?o encontrada.');
  }
}
