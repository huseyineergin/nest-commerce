import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "src/prisma/prisma.module";
import { TokenService } from "./token.service";

@Module({
  imports: [PrismaModule, JwtModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
