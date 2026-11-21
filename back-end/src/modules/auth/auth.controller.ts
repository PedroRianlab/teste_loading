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
    properties: { usuario: { type: 'string', example: 'operador' }, senha: { type: 'string', format: 'password' } },
  } })
  @ApiResponse({ status: 200, description: 'Token Bearer válido por uma hora.', schema: {
    type: 'object',
    properties: { token: { type: 'string' }, expiraEmSegundos: { type: 'integer', example: 3600 } },
  } })
  @ApiResponse({ status: 401, description: 'Usuário ou senha inválidos.' })
  @ApiResponse({ status: 503, description: 'Autenticação não configurada.' })
  login(@Body() dados: { usuario?: unknown; senha?: unknown } | null) {
    return this.auth.login(dados?.usuario, dados?.senha);
  }
}
