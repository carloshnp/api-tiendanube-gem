import { Controller, Get, Body } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Controller('orders')
export class ApiGatewayController {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      },
    });
  }

  @Get('check-orders')
  async getOrders( @Body() body: any) {
    console.log(body);
    try {
      return this.client.send<any>('check-orders', body).toPromise();
    } catch (error) {
      console.log(error);
    }
  }
}
