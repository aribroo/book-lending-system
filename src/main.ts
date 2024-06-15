import { setupSwagger } from './common/swagger/swagger.config';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  setupSwagger(app)

  const appHost = configService.get<string>('app.host');
  const appPort = configService.get<number>('app.port');
  const dbName = configService.get<string>('DATABASE_NAME');

  await app.listen(appPort, () => {
    console.info(`\nServer\t\t: http://${appHost}:${appPort}/api`);
    console.info(`Documentation\t: http://${appHost}:${appPort}/api/docs`);
    console.info(`Database Name\t: ${dbName}`);
  });
}
bootstrap();
