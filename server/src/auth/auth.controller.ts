import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/signIn.dto";
import { SignUpDto } from "./dto/signUp.dto";
import { JwtRefreshGuard } from "./guard/jwt-refresh.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-up")
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    const result = await this.authService.signUp(dto, res);
    return res.json({ ...result });
  }

  @Post("sign-in")
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    const result = await this.authService.signIn(dto, res);
    return res.json({ ...result });
  }

  @Post("sign-out")
  @UseGuards(JwtRefreshGuard)
  async signOut(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.signOut(req, res);
    return res.json({ ...result });
  }

  @Post("refresh-tokens")
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.refreshTokens(req, res);
    return res.json({ ...result });
  }
}
