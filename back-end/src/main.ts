import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3001' });
  app.enableShutdownHooks();
  const openApi = new DocumentBuilder()
    .setTitle('Central de Solicitações')
    .setDescription('Faça login em /auth/login e cole o token em Authorize para testar as solicitações.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, openApi));
  await app.listen(process.env.PORT ?? 3000, process.env.API_HOST ?? '127.0.0.1');
}
void bootstrap();
