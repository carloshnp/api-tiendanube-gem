import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './gateway.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  
  const app = await NestFactory.create(ApiGatewayModule);

  await app.listen(3000);
}
bootstrap();
