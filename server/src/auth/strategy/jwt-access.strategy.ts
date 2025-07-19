import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "src/common/types/tokenPayload";

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, "jwt-access") {
  constructor(private configService: ConfigService) {
    const secretKey = configService.get<string>("JWT_ACCESS_TOKEN_SECRET");

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secretKey || "secret",
      ignoreExpiration: false,
    });
  }

  validate(payload: TokenPayload) {
    return { userId: payload.sub };
  }
}
