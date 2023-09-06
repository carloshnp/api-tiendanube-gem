import { Module } from '@nestjs/common';
import { OrderCheckingController } from './order-checking.controller';
import { OrderCheckingService } from './order-checking.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Redis } from 'ioredis';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REDIS_CLIENT',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [OrderCheckingController],
  providers: [
    OrderCheckingService,
    {
      provide: 'REDIS_CLIENT',
      useValue: new Redis(),
    },
  ],
})
export class OrderCheckingModule {}
