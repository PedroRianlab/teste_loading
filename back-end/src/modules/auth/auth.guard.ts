import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(context: ExecutionContext) {
    const { authorization } = context.switchToHttp().getRequest().headers;
    const token = typeof authorization === 'string' ? /^Bearer (\S+)$/i.exec(authorization)?.[1] : undefined;
    if (!token || !this.auth.validar(token)) {
      throw new UnauthorizedException('Informe um token de acesso válido.');
    }
    return true;
  }
}
