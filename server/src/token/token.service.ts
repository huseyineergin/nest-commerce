import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { TokenPayload } from "src/common/types/tokenPayload";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class TokenService {
  private readonly refreshTokenExpiresInMs: number;
  private readonly refreshTokenSecret: string;

  private readonly accessTokenExpiresInMs: number;
  private readonly accessTokenSecret: string;

  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {
    this.refreshTokenExpiresInMs = this.configService.getOrThrow<number>("JWT_REFRESH_TOKEN_EXPIRATION_MS");
    this.refreshTokenSecret = this.configService.getOrThrow<string>("JWT_REFRESH_TOKEN_SECRET");
    this.accessTokenExpiresInMs = this.configService.getOrThrow<number>("JWT_ACCESS_TOKEN_EXPIRATION_MS");
    this.accessTokenSecret = this.configService.getOrThrow<string>("JWT_ACCESS_TOKEN_SECRET");
  }

  async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: `${this.accessTokenExpiresInMs}ms`,
        secret: this.accessTokenSecret,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: `${this.refreshTokenExpiresInMs}ms`,
        secret: this.refreshTokenSecret,
      }),
    ]);

    await this.createRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  async createRefreshToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + Number(this.refreshTokenExpiresInMs));

    const hashedToken = await bcrypt.hash(token, 10);

    return this.prismaService.refreshToken.create({
      data: {
        userId,
        expiresAt,
        hashedToken,
      },
    });
  }

  async findValidRefreshToken(userId: string, token: string) {
    const tokens = await this.prismaService.refreshToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
    });

    for (const t of tokens) {
      const match = await bcrypt.compare(token, t.hashedToken);
      if (match) return t;
    }

    return null;
  }

  async deleteTokenById(id: string) {
    return this.prismaService.refreshToken.delete({ where: { id } });
  }
}
