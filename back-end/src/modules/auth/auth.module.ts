import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
      errorMessage: 'Muitas tentativas. Aguarde um minuto e tente novamente.',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AuthRepository],
  exports: [AuthService],
})
export class AuthModule {}
