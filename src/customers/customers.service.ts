import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}
  private async findCustomerOrFail(customerId: string) {
    const customer = await this.prisma.user.findUnique({
      where: { userId: customerId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  private handlePrismaError(e: unknown): never {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException('Customer not found');
    }
    throw e;
  }

  async update(customerId: string, dto: UpdateCustomerDto) {
    try {
      const customer = await this.prisma.user.update({
        where: { userId: customerId },
        data: dto,
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

      return {
        message: 'Customer updated successfully',
        data: customer,
      };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }

  async getOrders(customerId: string) {
    await this.findCustomerOrFail(customerId);

    const orders = await this.prisma.order.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Orders retrieved successfully',
      data: orders,
    };
  }

  async updatePreferences(customerId: string, dto: UpdatePreferencesDto) {
    try {
      const customer = await this.prisma.user.update({
        where: { userId: customerId },
        data: { preferences: dto.preferences as Prisma.InputJsonValue },
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

      return {
        message: 'Preferences updated successfully',
        data: customer,
      };
    } catch (e) {
      this.handlePrismaError(e);
    }
  }
}