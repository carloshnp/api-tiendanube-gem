import { Body, Controller, Get } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";

@Controller("orders")
export class ApiGatewayController {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        host: "localhost",
        port: 6379,
      },
    });
  }

  @Get("get-tokens")
  async getTokens(@Body() body: any) {
    console.log(body);
    try {
      return this.client.send<any>("get-tokens", body).toPromise();
    } catch (error) {
      console.log(error);
    }
  }

  @Get("check-orders")
  async getOrders(@Body() body: any) {
    console.log(body);
    try {
      return this.client.send<any>("check-orders", body).toPromise();
    } catch (error) {
      console.log(error);
    }
  }

  @Get("check-order-by-id")
  async getOrderById(@Body() body: any) {
    try {
      return this.client.send<any>("check-order-by-id", body).toPromise();
    } catch (error) {
      console.log(error);
    }
  }

  @Get("get-each-order")
  async getEachOrder(@Body() body: any) {
    try {
      return this.client.send<any>("get-each-order", body).toPromise();
    } catch (error) {
      console.log(error);
    }
  }
}
