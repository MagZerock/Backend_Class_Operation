import * as crypto from "crypto";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    return this.prisma.user.create({
      data: { userId: crypto.randomUUID(), ...dto },
    });
  }

  async login(dto: LoginDto) {
    return this.prisma.user.findUnique({ where: { email: dto.email } });
  }

  async refresh(dto: RefreshDto) {
    return this.prisma.userSession.findUnique({
      where: { refreshToken: dto.refreshToken },
    });
  }

  async logout(refreshToken: string) {
    return this.prisma.userSession.updateMany({
      where: { refreshToken, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { userId },
      select: { userId: true, name: true, email: true, phone: true, role: true, preferences: true, createdAt: true },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    return this.prisma.user.findUnique({ where: { email: dto.email } });
  }

  async resetPassword(dto: ResetPasswordDto) {
    return this.prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });
  }
}
