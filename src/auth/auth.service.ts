import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateAccessToken(userId: string, role: string): string {
    return this.jwtService.sign({ sub: userId, role });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  private async createSession(userId: string, role: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const accessToken  = this.generateAccessToken(userId, role);
    const refreshToken = this.generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.userSession.create({
      data: { userId, refreshToken, expiresAt },
    });

    return { accessToken, refreshToken, expiresIn: 3600 };
  }

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.passwordHash, 10);

    const user = await this.prisma.user.create({
      data: {
        userId: crypto.randomUUID(),
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        passwordHash,
        role: 'customer',
        preferences: {
          favoriteDishes: [],
          allergies: [],
          communicationPreferences: {},
          loyaltyLevel: 1,
        },
      },
    });

    const tokens = await this.createSession(user.userId, user.role);

    return {
      message: 'User registered successfully',
      data: {
        ...tokens,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.createSession(user.userId, user.role);

    return {
      message: 'Login successful',
      data: {
        ...tokens,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  }

  async refresh(dto: RefreshDto) {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken: dto.refreshToken },
    });

    if (!session || session.isRevoked) {
      throw new UnauthorizedException('Invalid or revoked refresh token');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { userId: session.userId },
    });
    
    if (!user) {
    throw new UnauthorizedException('User associated with this session no longer exists');
  }
    const accessToken = this.generateAccessToken(user.userId, user.role);

    return {
      message: 'Token refreshed successfully',
      data: { accessToken, expiresIn: 3600 },
    };
  }

  async logout(authHeader: string) {
    if (!authHeader) throw new UnauthorizedException('Token not provided');

    const refreshToken = authHeader.replace('Bearer ', '').trim();

    const result = await this.prisma.userSession.updateMany({
      where: { refreshToken, isRevoked: false },
      data: { isRevoked: true },
    });

    if (result.count === 0) {
      throw new UnauthorizedException('Invalid or already revoked token');
    }

    return {
      message: 'Logged out successfully',
      data: { revokedSessions: result.count },
    };
  }

  async getMe(userId: string) {
    if (!userId) throw new UnauthorizedException('Header x-user-id is required');

    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        preferences: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        message: 'If the email is registered, you will receive a recovery link',
        data: null,
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt,
      },
    });

    console.log(`Password reset token for ${dto.email}: ${token}`);

    return {
      message: 'If the email is registered, you will receive a recovery link',
      data: null,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { userId: user.userId },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });

    return {
      message: 'Password updated successfully',
      data: { userId: user.userId, email: user.email },
    };
  }
}