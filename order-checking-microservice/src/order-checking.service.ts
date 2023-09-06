import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderCheckingService {
  getHello(): string {
    return 'Hello World!';
  }
}
