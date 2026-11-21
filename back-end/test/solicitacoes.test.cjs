const test = require('node:test');
const assert = require('node:assert/strict');
const { BadRequestException, ConflictException, NotFoundException } = require('@nestjs/common');
const { SolicitacoesService } = require('../dist/modules/solicitacoes/solicitacoes.service');

test('cadastro valida e normaliza campos obrigatórios', async () => {
  let recebido;
  const service = new SolicitacoesService({ criar: (dados) => { recebido = dados; return dados; } });
  service.criar({ titulo: ' Acesso ', descricao: ' Detalhes ', categoria: ' TI ', prioridade: 'MEDIA' });
  assert.deepEqual(recebido, { titulo: 'Acesso', descricao: 'Detalhes', categoria: 'TI', prioridade: 'MEDIA' });
  assert.throws(() => service.criar({ titulo: ' ', descricao: 'x', categoria: 'TI', prioridade: 'MEDIA' }), BadRequestException);
  assert.throws(() => service.criar({ titulo: 'x', descricao: 'x', categoria: 'TI', prioridade: 'MEDIA', status: 'CONCLUIDA' }), BadRequestException);
});

test('status respeita a sequência e detecta alteração simultânea', async () => {
  let status = 'ABERTA';
  const repo = {
    buscar: async () => ({ id: '1', status }),
    alterarStatus: async (_id, anterior, proximo) => {
      if (status !== anterior) return null;
      status = proximo;
      return { id: '1', status };
    },
  };
  const service = new SolicitacoesService(repo);
  await assert.rejects(service.alterarStatus('1', { status: 'CONCLUIDA' }), BadRequestException);
  assert.equal((await service.alterarStatus('1', { status: 'EM_ANDAMENTO' })).status, 'EM_ANDAMENTO');
  assert.equal((await service.alterarStatus('1', { status: 'CONCLUIDA' })).status, 'CONCLUIDA');
  await assert.rejects(service.alterarStatus('1', { status: 'ABERTA' }), BadRequestException);
  status = 'ABERTA';
  repo.alterarStatus = async () => null;
  await assert.rejects(service.alterarStatus('1', { status: 'EM_ANDAMENTO' }), ConflictException);
});

test('filtros são validados e registros inexistentes retornam erro', async () => {
  const service = new SolicitacoesService({ listar: (filtros) => filtros, buscar: async () => null });
  assert.deepEqual(service.listar({ status: 'ABERTA', prioridade: 'ALTA' }), { status: 'ABERTA', prioridade: 'ALTA' });
  assert.throws(() => service.listar({ status: 'INEXISTENTE' }), BadRequestException);
  await assert.rejects(service.buscar('inexistente'), NotFoundException);
});
