import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrderCheckingService } from './order-checking.service';
import { TiendanubeGuard } from './tiendanube/tiendanube.guard';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
@UseGuards(TiendanubeGuard)
export class OrderCheckingController {
  constructor(private readonly orderCheckingService: OrderCheckingService) {}

  @MessagePattern('check-orders')
  @Get()
  getHello(): string {
    return this.orderCheckingService.getHello();
  }
}