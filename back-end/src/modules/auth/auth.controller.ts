import { Body, Controller, Header, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Autenticação')
@UseGuards(ThrottlerGuard)
@ApiResponse({ status: 429, description: 'Limite de tentativas atingido. Aguarde um minuto.' })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @ApiBody({ schema: {
    type: 'object',
    required: ['usuario', 'senha'],
    properties: { usuario: { type: 'string', description: 'Nome de usuário ou e-mail.', example: 'operador' }, senha: { type: 'string', format: 'password' } },
  } })
  @ApiResponse({ status: 200, description: 'Token Bearer válido por uma hora.', schema: {
    type: 'object',
    properties: { token: { type: 'string' }, expiraEmSegundos: { type: 'integer', example: 3600 } },
  } })
  @ApiResponse({ status: 401, description: 'Usuário ou senha inválidos.' })
  login(@Body() dados: { usuario?: unknown; senha?: unknown } | null) {
    return this.auth.login(dados?.usuario, dados?.senha);
  }

  @Post('registro')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @ApiBody({ schema: {
    type: 'object',
    required: ['usuario', 'senha'],
    properties: {
      usuario: { type: 'string', maxLength: 254, description: 'Nome de usuário ou e-mail.', example: 'maria@example.com' },
      senha: { type: 'string', format: 'password', minLength: 8, maxLength: 128 },
    },
  } })
  @ApiResponse({ status: 201, description: 'Conta criada.' })
  @ApiResponse({ status: 400, description: 'Usuário ou senha fora do formato.' })
  @ApiResponse({ status: 403, description: 'Criação de contas desativada.' })
  @ApiResponse({ status: 409, description: 'Nome de usuário em uso.' })
  registrar(@Body() dados: { usuario?: unknown; senha?: unknown } | null) {
    return this.auth.registrar(dados?.usuario, dados?.senha);
  }
}
