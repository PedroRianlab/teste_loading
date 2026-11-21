import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { AuthRepository } from './auth.repository';

const DURACAO_SEGUNDOS = 3600;
const derivarSenha = promisify(scrypt);
const formatoUsuario = /^[a-z0-9._-]{3,32}$/;
const formatoEmail = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

function identificadorValido(valor: string) {
  return formatoUsuario.test(valor) || (valor.length <= 254 && formatoEmail.test(valor));
}

function iguais(a: string, b: string) {
  const hash = (valor: string) => createHash('sha256').update(valor).digest();
  return timingSafeEqual(hash(a), hash(b));
}

@Injectable()
export class AuthService {
  private readonly chave = randomBytes(32);

  constructor(private readonly config: ConfigService, private readonly repository: AuthRepository) {}

  async registrar(usuario: unknown, senha: unknown) {
    if (this.config.get('AUTH_REGISTRO_ABERTO') !== 'true') {
      throw new ForbiddenException('A criação de contas está desativada neste ambiente.');
    }
    const nome = typeof usuario === 'string' ? usuario.trim().toLowerCase() : '';
    if (!identificadorValido(nome)) {
      throw new BadRequestException('Informe um e-mail válido ou um usuário de 3 a 32 caracteres com letras, números, pontos, hífens ou sublinhados.');
    }
    if (typeof senha !== 'string' || senha.length < 8 || senha.length > 128 || !senha.trim()) {
      throw new BadRequestException('A senha deve ter de 8 a 128 caracteres.');
    }
    if (nome === this.config.get<string>('AUTH_USUARIO')?.trim().toLowerCase()) {
      throw new ConflictException('Esse nome de usuário já está em uso.');
    }
    const sal = randomBytes(16).toString('hex');
    const hash = (await derivarSenha(senha, sal, 64)) as Buffer;
    try {
      return await this.repository.criar(nome, `${sal}:${hash.toString('hex')}`);
    } catch (erro) {
      if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === 'P2002') {
        throw new ConflictException('Esse nome de usuário já está em uso.');
      }
      throw erro;
    }
  }

  async login(usuario: unknown, senha: unknown) {
    if (typeof usuario !== 'string' || usuario.trim().length > 254 || typeof senha !== 'string' || senha.length > 128) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
    }
    const nome = usuario.trim().toLowerCase();
    const usuarioConfigurado = this.config.get<string>('AUTH_USUARIO')?.trim().toLowerCase();
    const senhaConfigurada = this.config.get<string>('AUTH_SENHA');
    if (nome === usuarioConfigurado) {
      if (!senhaConfigurada || !iguais(senha, senhaConfigurada)) {
        throw new UnauthorizedException('Usuário ou senha inválidos.');
      }
    } else {
      const conta = identificadorValido(nome) ? await this.repository.buscar(nome) : null;
      const [sal, hash] = conta?.senhaHash.split(':') ?? ['sal-inexistente', '0'.repeat(128)];
      const calculado = (await derivarSenha(senha, sal, 64)) as Buffer;
      if (!timingSafeEqual(calculado, Buffer.from(hash, 'hex')) || !conta) {
        throw new UnauthorizedException('Usuário ou senha inválidos.');
      }
    }

    const expiraEm = Math.floor(Date.now() / 1000) + DURACAO_SEGUNDOS;
    const dados = `${expiraEm}.${randomBytes(16).toString('hex')}`;
    return { token: `${dados}.${this.assinar(dados)}`, expiraEmSegundos: DURACAO_SEGUNDOS };
  }

  validar(token: string) {
    const partes = /^(\d{10,12})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token);
    if (!partes) return false;
    const [, expiraEm, nonce, assinatura] = partes;
    return Number(expiraEm) > Math.floor(Date.now() / 1000)
      && iguais(assinatura, this.assinar(`${expiraEm}.${nonce}`));
  }

  private assinar(dados: string) {
    return createHmac('sha256', this.chave).update(dados).digest('hex');
  }
}
