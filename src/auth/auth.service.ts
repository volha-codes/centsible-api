import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from '@node-rs/argon2';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ email, firstName, password }: RegisterDto) {
    try {
      const hashedPassword = await hash(password);

      return await this.prisma.user.create({
        data: {
          email: normalizeEmail(email),
          firstName: firstName.trim(),
          hashedPassword,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const errorMessage = 'Invalid email or password';

    const user = await this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
    });

    if (!user) {
      throw new UnauthorizedException(errorMessage);
    }

    const isPasswordValid = await verify(user.hashedPassword, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(errorMessage);
    }

    const accessToken = await this.jwtService.signAsync({ sub: user.id });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
      },
    };
  }
}
