import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { parseCorsWhitelist } from './common/utils/parse-cors-whitelist';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  const corsWhiteList = parseCorsWhitelist(process.env.CORS_WHITELIST ?? '');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (...args: any[]) => void,
    ) => {
      if (!origin || corsWhiteList.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'), false);
      // É possível mudar a abordagem acima, ou seja, não levantar uma exceção
      // quando a Origin é desconhecida pelo servidor
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.APP_PORT ?? 3001);
}
void bootstrap();
