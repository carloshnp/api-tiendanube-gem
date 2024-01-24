import { Module } from "@nestjs/common";
import { TokenRequestController } from "./token-request.controller";
import { TokenRequestService } from "./token-request.service";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Redis } from "ioredis";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "REDIS_CLIENT",
        transport: Transport.REDIS,
        options: {
          host: "localhost",
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [TokenRequestController],
  providers: [
    TokenRequestService,
    {
      provide: "REDIS_CLIENT",
      useValue: new Redis(),
    },
  ],
})
export class TokenRequestModule {}
