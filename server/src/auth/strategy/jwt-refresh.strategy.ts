import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TokenPayload } from "src/common/types/tokenPayload";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(private configService: ConfigService) {
    const secretKey = configService.get<string>("JWT_REFRESH_TOKEN_SECRET");

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          return (req.cookies.refreshToken as string) || null;
        },
      ]),
      secretOrKey: secretKey || "secret",
      ignoreExpiration: false,
    });
  }

  validate(payload: TokenPayload) {
    return { userId: payload.sub };
  }
}
