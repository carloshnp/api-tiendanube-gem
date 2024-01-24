import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { TiendanubeAccessTokenRequestDto } from './tiendanube.dto';
import { validate } from 'class-validator';
import axios from 'axios';
import Redis from 'ioredis';
import { AccessTokenResponseDto } from './access-token.dto';
import { MessagePattern } from '@nestjs/microservices';

@Injectable()
export class TiendanubeGuard implements CanActivate {
  private readonly redisClient: Redis;

  constructor(
    @Inject('REDIS_CLIENT') private readonly injectedRedisClient: Redis,
  ) {
    this.redisClient = injectedRedisClient;
  }

  @MessagePattern('check-orders')
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { client_id, client_secret, code, store } = request;

    // Request data validation (DTO)
    const tiendanubeDto = new TiendanubeAccessTokenRequestDto();
    tiendanubeDto.client_id = client_id;
    tiendanubeDto.client_secret = client_secret;
    tiendanubeDto.code = code;

    const errors = await validate(tiendanubeDto);

    if (errors.length > 0) {
      throw new Error('Validation failed');
    }

    const hashKey = 'access_tokens'; 

    const accessToken = await this.injectedRedisClient.hget(hashKey, store);

    if (!accessToken) {
      const newAccessToken = await this.getAccessToken(tiendanubeDto);
      const { user_id } = newAccessToken;

      const jsonString = JSON.stringify(newAccessToken);
      await this.injectedRedisClient.hset(hashKey, store, jsonString);

      // You can store the access token in the request or use it as needed
      request['token'] = newAccessToken;
    }
    console.log("The request is processed: \n", request);
    return true;
  }

  async getAccessToken(dto: TiendanubeAccessTokenRequestDto): Promise<AccessTokenResponseDto> {
    const url = 'https://www.tiendanube.com/apps/authorize/token';
    const grant_type = 'authorization_code';
    const { client_id, client_secret, code } = dto;
    const headers = { 'Content-Type': 'application/json' };
    const data = {
      client_id,
      client_secret,
      grant_type,
      code,
    };

    try {
      const response = await axios.post<AccessTokenResponseDto>(url, data, { headers });
      const accessToken = response.data;
      return accessToken;
    } catch (error) {
      throw new Error(
        'There was an error while trying to retrieve the access token. Please check your credentials'
      );
    }
  }
}
