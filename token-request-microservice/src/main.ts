import { NestFactory } from '@nestjs/core';
import { TokenRequestModule } from './token-request.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TokenRequestModule,
    {
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      },
    },
  );

  await app.listen();
}
bootstrap();
