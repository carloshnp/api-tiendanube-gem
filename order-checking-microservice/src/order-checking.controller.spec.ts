import { Test, TestingModule } from '@nestjs/testing';
import { OrderCheckingController } from './order-checking.controller';
import { OrderCheckingService } from './order-checking.service';

describe('AppController', () => {
  let orderCheckingController: OrderCheckingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrderCheckingController],
      providers: [OrderCheckingService],
    }).compile();

    orderCheckingController = app.get<OrderCheckingController>(OrderCheckingController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(orderCheckingController.getHello()).toBe('Hello World!');
    });
  });
});
