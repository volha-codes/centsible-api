import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import { LoginDto } from './dto/login.dto';
import { COOKIE_NAME } from './auth.constants';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private setCookie(response: FastifyReply, accessToken: string) {
    response.setCookie(COOKIE_NAME, accessToken, {
      httpOnly: true,
      secure: this.config.get<string>('COOKIE_SECURE') === 'true',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  @Public()
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    await this.authService.register(registerDto);

    const data = await this.authService.login(
      registerDto.email,
      registerDto.password,
    );

    this.setCookie(response, data.accessToken);

    return data.user;
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const data = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    this.setCookie(response, data.accessToken);

    return data.user;
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: FastifyReply) {
    response.clearCookie(COOKIE_NAME, { path: '/' });
  }

  @Get('me')
  getProfile(@CurrentUser() userId: string) {
    return this.authService.getProfile(userId);
  }
}
