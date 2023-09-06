import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { TiendanubeAccessTokenRequestDto } from './tiendanube.dto';
import { validate } from 'class-validator';
import axios from 'axios';
import Redis from 'ioredis';
import { AccessTokenResponseDto } from './access-token.dto';

@Injectable()
export class TiendanubeGuard implements CanActivate {
  private readonly redisClient: Redis;

  constructor(
    @Inject('REDIS_CLIENT') private readonly injectedRedisClient: Redis,
  ) {
    this.redisClient = injectedRedisClient;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log(request);
    const { client_id, client_secret, code } = request;

    // Request data validation (DTO)
    const tiendanubeDto = new TiendanubeAccessTokenRequestDto();
    tiendanubeDto.client_id = client_id;
    tiendanubeDto.client_secret = client_secret;
    tiendanubeDto.code = code;

    const errors = await validate(tiendanubeDto);

    if (errors.length > 0) {
      throw new Error('Validation failed');
    }

    const hashKey = 'access_tokens'; // Use the same common hash key

    // Check if the access token already exists in the Redis hash
    const accessToken = await this.injectedRedisClient.hget(hashKey, client_id);

    if (accessToken) {
      try {
        // Access token exists in Redis, parse it as JSON
        const parsedAccessToken = JSON.parse(accessToken);

        // Use the parsed access token
        request.accessToken = parsedAccessToken;
        console.log(parsedAccessToken);
        return true;
      } catch (error) {
        // Handle parsing error, e.g., log and return false
        console.error('Error parsing access token:', error);
        return false;
      }
    } else {
      // Fetch a new access token from the external source
      const newAccessToken = await this.getAccessToken(tiendanubeDto);
      const { access_token } = newAccessToken;

      // Store the new access token as a JSON string in Redis hash
      const jsonString = JSON.stringify(newAccessToken);
      await this.injectedRedisClient.hset(hashKey, client_id, jsonString);

      // You can store the access token in the request or use it as needed
      request.accessToken = newAccessToken;

      console.log("This is the access token: ", newAccessToken);

      return true;
    }

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
