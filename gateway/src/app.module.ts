import { Module } from '@nestjs/common';
import { ApiGatewayController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [ApiGatewayController],
  providers: [AppService],
})
export class AppModule {}
