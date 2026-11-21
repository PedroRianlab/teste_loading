import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  criar(usuario: string, senhaHash: string) {
    return this.prisma.usuario.create({
      data: { usuario, senhaHash },
      select: { usuario: true },
    });
  }

  buscar(usuario: string) {
    return this.prisma.usuario.findUnique({ where: { usuario } });
  }
}
