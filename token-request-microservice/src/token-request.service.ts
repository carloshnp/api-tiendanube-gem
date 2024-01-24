import { Inject, Injectable } from '@nestjs/common';
import { TiendanubeAccessTokenRequestDto } from './dto/tiendanube.dto';
import { Redis } from 'ioredis';
import axios from 'axios';
import { AccessTokenResponseDto } from './dto/access-token.dto';

@Injectable()
export class TokenRequestService {
  private readonly redisClient: Redis;
  constructor(
    @Inject('REDIS_CLIENT') private readonly injectedRedisClient: Redis
  ) {
    this.redisClient = injectedRedisClient;
  }

  async getAccessToken({ client_id, client_secret, grant_type, code, store }: TiendanubeAccessTokenRequestDto, hashKey): Promise<boolean> {
    const data = { client_id, client_secret, grant_type, code };
    const accessToken = await this.requestToken(data);

    const { user_id } = accessToken;

    const jsonString = JSON.stringify(accessToken);
    await this.injectedRedisClient.hset(hashKey, store, jsonString);

    return true;
  }

  async requestToken(data): Promise<any> {
    const url = 'https://www.tiendanube.com/apps/authorize/token';
    const headers = { 'Content-Type': 'application/json' };
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

  async checkAccessToken({ store }: TiendanubeAccessTokenRequestDto, hashKey): Promise<boolean> {
    const accessToken = await this.injectedRedisClient.hget(hashKey, store)
    return Boolean(accessToken); 
  }

}
