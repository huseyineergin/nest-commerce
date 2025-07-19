import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TokenModule } from "src/token/token.module";
import { UserModule } from "src/user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAccessStrategy } from "./strategy/jwt-access.strategy";
import { JwtRefreshStrategy } from "./strategy/jwt-refresh.strategy";

@Module({
  imports: [UserModule, PassportModule, TokenModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
