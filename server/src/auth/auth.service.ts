import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { TokenService } from "src/token/token.service";
import { UserService } from "src/user/user.service";
import { SignInDto } from "./dto/signIn.dto";
import { SignUpDto } from "./dto/signUp.dto";

@Injectable()
export class AuthService {
  private readonly refreshTokenExpiresInMs: number;
  private readonly refreshTokenSecret: string;
  private readonly isProduction: boolean;

  constructor(
    private tokenService: TokenService,
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService
  ) {
    this.refreshTokenExpiresInMs = this.configService.getOrThrow<number>("JWT_REFRESH_TOKEN_EXPIRATION_MS");
    this.refreshTokenSecret = this.configService.getOrThrow<string>("JWT_REFRESH_TOKEN_SECRET");
    this.isProduction = this.configService.getOrThrow<string>("NODE_ENV") === "production";
  }

  async signUp(dto: SignUpDto, res: Response) {
    const { email, username, password } = dto;

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      if (existingUser.email === email) throw new ConflictException("Email is already in use.");

      if (existingUser.username === username) throw new ConflictException("Username is already in use.");
    }

    const createdUser = await this.userService.create({
      email,
      username,
      password: await bcrypt.hash(password, 10),
    });

    const { accessToken, refreshToken } = await this.tokenService.generateTokens(createdUser.id);

    this.setRefreshTokenCookie(res, refreshToken);

    return {
      message: "Signed up successfully.",
      data: {
        accessToken,
      },
    };
  }

  async signIn(dto: SignInDto, res: Response) {
    const { email, password } = dto;

    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException("Invalid email or password.");

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) throw new UnauthorizedException("Invalid email or password.");

    const { accessToken, refreshToken } = await this.tokenService.generateTokens(user.id);

    this.setRefreshTokenCookie(res, refreshToken);

    return {
      message: "Signed in successfully.",
      data: {
        accessToken,
      },
    };
  }

  async signOut(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) throw new UnauthorizedException("Invalid refresh token.");

    const decoded: { sub: string } = this.jwtService.verify(refreshToken, {
      secret: this.refreshTokenSecret,
    });

    const storedToken = await this.tokenService.findValidRefreshToken(decoded.sub, refreshToken);

    if (storedToken) await this.tokenService.deleteTokenById(storedToken.id);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: this.isProduction,
      path: "/auth/refresh-tokens",
    });

    return { message: "Signed out successfully." };
  }

  async refreshTokens(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) throw new UnauthorizedException("Invalid refresh token.");

    const decoded: { sub: string } = this.jwtService.verify(refreshToken, {
      secret: this.refreshTokenSecret,
    });

    if (!decoded) throw new UnauthorizedException("Invalid refresh token.");

    const user = await this.userService.findById(decoded.sub);

    if (!user) throw new UnauthorizedException("Invalid refresh token.");

    const storedRefreshToken = await this.tokenService.findValidRefreshToken(user.id, refreshToken);
    if (!storedRefreshToken) throw new UnauthorizedException("Refresh token not recognized.");
    await this.tokenService.deleteTokenById(storedRefreshToken.id);

    const { accessToken, refreshToken: newRefreshToken } = await this.tokenService.generateTokens(user.id);

    this.setRefreshTokenCookie(res, newRefreshToken);

    return {
      message: "Tokens are refreshed successfully.",
      data: {
        accessToken,
      },
    };
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: this.isProduction,
      path: "/auth/refresh-tokens",
      maxAge: this.refreshTokenExpiresInMs,
    });
  }
}
