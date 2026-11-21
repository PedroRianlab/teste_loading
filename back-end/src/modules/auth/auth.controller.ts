import { Body, Controller, Header, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  login(@Body() dados: { usuario?: unknown; senha?: unknown } | null) {
    return this.auth.login(dados?.usuario, dados?.senha);
  }
}
