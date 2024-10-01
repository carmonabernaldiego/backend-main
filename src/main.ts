import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Obtener instancia del ConfigService desde el módulo
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Utilizar el servicio para obtener el puerto desde las variables de entorno
  const port = configService.get('PORT') || 3000; // Puedes usar 3000 como puerto por defecto

  await app.listen(port);
}
bootstrap();
