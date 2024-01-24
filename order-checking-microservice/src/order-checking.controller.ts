import { ConsoleLogger, Controller, Get, UseGuards } from '@nestjs/common';
import { OrderCheckingService } from './order-checking.service';
import { TiendanubeGuard } from './tiendanube/tiendanube.guard';
import { MessagePattern } from '@nestjs/microservices';
import { Redis } from 'ioredis';
import axios from 'axios';

const redisClient = new Redis({
  host: 'localhost',
  port: 6379,
})

@Controller()
export class OrderCheckingController {
  constructor(private readonly orderCheckingService: OrderCheckingService) { }

  @MessagePattern('check-orders')
  @UseGuards(TiendanubeGuard)
  @Get()
  async getOrdersFromStores() {
    try {
      // Creates a list of tokens per user
      const tokens = await redisClient.hgetall('access_tokens');
      const tokenList: any[] = [];
      for (const key in tokens) {
        if (Object.hasOwnProperty.call(tokens, key)) {
          const tokenString = tokens[key];
          const tokenObject = JSON.parse(tokenString);
          tokenList.push(tokenObject);
        }
      }
      console.log("The parsed tokens are: \n", tokenList);

      // Gets the orders from each user
      const ordersList: any[] = [];
      const headers = {
        'User-Agent': 'aquaarte (Marco@gestaoemmolduras.com.br)',
        'Content-Type': 'application/json',
      };
      const baseUrl = 'https://api.tiendanube.com/v1/';
      for (const tokenObject of tokenList) {
        // Extract relevant parameters from the token object
        const { access_token, user_id } = tokenObject;
        // Define the request URL with dynamic parameters
        const requestUrl = `${baseUrl}${user_id}/orders?fields=id,status,payment_status&channels=store`;
        // Make the HTTP request
        await axios
          .get(requestUrl, {
            headers: {
              ...headers,
              'Authentication': `bearer ${access_token}`,
            },
          })
          .then((response) => {
            // Process the response and store the result as needed
            ordersList.push(response.data);
          })
          .catch((error) => {
            // Handle errors, e.g., log or handle specific error cases
            console.error('Error making request:', error);
          });
        console.log("The products from this store is: \n", ordersList)
      }

      // Send list of products to Redis
      const hashName = 'orders';
      const storeName = 'aquaarte';
      for (const product of ordersList) {
        // Push each product list to the Redis hash
        await redisClient.hset(hashName, storeName, JSON.stringify(product));
      }
      return ordersList;
    } catch (error) {
      console.log(error);
    }
  }

  @MessagePattern('check-order-by-id')
  @UseGuards(TiendanubeGuard)
  @Get()
  async getOrderDetail() {
    try {
      const tokens = await redisClient.hgetall('access_tokens');
      const tokenList: any[] = [];
      for (const key in tokens) {
        if (Object.hasOwnProperty.call(tokens, key)) {
          const tokenString = tokens[key];
          const tokenObject = JSON.parse(tokenString);
          tokenList.push(tokenObject);
        }
      }
      console.log("The parsed tokens are: \n", tokenList);

      const orders = await redisClient.hgetall('orders');
      const orderList: any[] = [];
      for (const key in orders) {
        if (Object.hasOwnProperty.call(orders, key)) {
          const orderString = orders[key];
          const orderObject = JSON.parse(orderString);
          orderList.push(orderObject);
        }
      }

      console.log("The parsed orders are: \n", orderList);

      // Gets the orders from each user
      const ordersByIdList: any[] = [];
      const headers = {
        'User-Agent': 'aquaarte (Marco@gestaoemmolduras.com.br)',
        'Content-Type': 'application/json',
      };
      const baseUrl = 'https://api.tiendanube.com/v1/';

      // Iterate over each order in the orderList
      for (const orderObject of orderList) {
        for (const order of orderObject) {
          console.log(order);
          const { id, status, payment_status } = order; // Assuming your order object has a 'user_id' and 'orderId' property
          console.log(id);
          // Passa o pedido caso status = open e payment_status = paid
          if (status === 'open' && payment_status === 'paid') {
            console.log("This order is valid for processing: ", id);
            // Extract relevant parameters from the token object
            const access_token = '7b65ae1ba32c72a98926fb5de0de4ad06868d482';
            const user_id = '2498249'

            // Define the request URL with dynamic parameters
            const requestUrl = `${baseUrl}${user_id}/orders/${id}`;

            try {
              // Make the HTTP request
              const response = await axios.get(requestUrl, {
                headers: {
                  ...headers,
                  'Authentication': `bearer ${access_token}`,
                },
              });

              // Process the response and store the result as needed
              ordersByIdList.push(response.data);
            } catch (error) {
              // Handle errors, e.g., log or handle specific error cases
              console.error('Error making request:', error);
            }
          }
        }
      }

      // console.log("The products from this store is: \n", ordersByIdList);
      
      // Send list of products to Redis
      const hashName = 'individual_order';
      const storeName = 'aquaarte';
      console.log(ordersByIdList.length);
      for (const order of ordersByIdList) {
        // Push each product list to the Redis hash
        await redisClient.hset(hashName, storeName, JSON.stringify(order));
      }
      return ordersByIdList;

    } catch (error) {
      console.log(error);
    }
  }

  @MessagePattern('get-each-order')
  @UseGuards(TiendanubeGuard)
  @Get()
  async getOrdersList() {
    try {
      const orders = await redisClient.hgetall('individual_order');
      const orderList: any[] = [];
      for (const key in orders) {
        if (Object.hasOwnProperty.call(orders, key)) {
          const orderString = orders[key];
          const orderObject = JSON.parse(orderString);
          orderList.push(orderObject);
        }
      }
      console.log(orderList)

      const orderJson = {
        "orders_update": {
          "domain": "nuvemshop",
          "user_id": "2498249",
          "store_name": "aquaarte",
          "orders": orderList
        }
      }

      console.log("The resultng JSON is: ", orderJson)

      return orderJson;

    } catch (error) {
      console.log(error);
    }
  }

}

