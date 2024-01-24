import { Controller, Get } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { TiendanubeAccessTokenRequestDto } from "./dto/tiendanube.dto";
import { validate } from "class-validator";
import { TokenRequestService } from "./token-request.service";

@Controller()
export class TokenRequestController {
  constructor(private readonly tokenRequestService: TokenRequestService) { }

  @MessagePattern("get-tokens")
  @Get()
  async getTokens(tiendanubeAccessTokenRequestDto: TiendanubeAccessTokenRequestDto): Promise<boolean> {
    const errors = await validate(tiendanubeAccessTokenRequestDto);
    if (errors.length > 0) {
      throw new Error("Validation failed");
    }

    const hashKey = 'access_tokens';
    const checkAccessToken = await this.tokenRequestService.checkAccessToken(tiendanubeAccessTokenRequestDto, hashKey);

    if (!checkAccessToken) {
      try {
        const getAccessToken = await this.tokenRequestService.getAccessToken(tiendanubeAccessTokenRequestDto, hashKey);
        console.log("The request is processed: \n", tiendanubeAccessTokenRequestDto);
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log("This store already has a token registered!")
    }

    return true;
  }
}
