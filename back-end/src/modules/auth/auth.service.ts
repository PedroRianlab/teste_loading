import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const DURACAO_SEGUNDOS = 3600;

function iguais(a: string, b: string) {
  const hash = (valor: string) => createHash('sha256').update(valor).digest();
  return timingSafeEqual(hash(a), hash(b));
}

@Injectable()
export class AuthService {
  private readonly chave = randomBytes(32);

  constructor(private readonly config: ConfigService) {}

  login(usuario: unknown, senha: unknown) {
    const usuarioConfigurado = this.config.get<string>('AUTH_USUARIO');
    const senhaConfigurada = this.config.get<string>('AUTH_SENHA');
    if (!usuarioConfigurado || !senhaConfigurada) {
      throw new ServiceUnavailableException('Autenticação ainda não configurada.');
    }

    const usuarioValido = typeof usuario === 'string' && iguais(usuario, usuarioConfigurado);
    const senhaValida = typeof senha === 'string' && iguais(senha, senhaConfigurada);
    if (!usuarioValido || !senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos.');
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
