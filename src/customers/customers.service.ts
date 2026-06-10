import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async update(customerId: string, dto: UpdateCustomerDto) {
    return this.prisma.user.update({ where: { userId: customerId }, data: dto });
  }

  async getOrders(customerId: string) {
    return this.prisma.order.findMany({ where: { userId: customerId } });
  }

  async updatePreferences(customerId: string, dto: UpdatePreferencesDto) {
    return this.prisma.user.update({
      where: { userId: customerId },
      data: { preferences: dto.preferences as Prisma.InputJsonValue },
    });
  }
}
