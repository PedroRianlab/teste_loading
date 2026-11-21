import { Body, Controller, Header, HttpCode, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Autenticação')
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
  @ApiResponse({ status: 409, description: 'Nome de usuário em uso.' })
  registrar(@Body() dados: { usuario?: unknown; senha?: unknown } | null) {
    return this.auth.registrar(dados?.usuario, dados?.senha);
  }
}
