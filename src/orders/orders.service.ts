import * as crypto from "crypto";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.order.findMany();
  }

  async findOne(orderId: string) {
    return this.prisma.order.findUnique({ where: { orderId } });
  }

  async create(dto: CreateOrderDto) {
    const { items, ...orderData } = dto;
    return this.prisma.order.create({
      data: {
        ...orderData,
        orderId: crypto.randomUUID(),
        items: { create: items },
      },
    });
  }

  async update(orderId: string, dto: UpdateOrderDto) {
    return this.prisma.order.update({ where: { orderId }, data: dto });
  }

  async remove(orderId: string) {
    return this.prisma.order.delete({ where: { orderId } });
  }
}
