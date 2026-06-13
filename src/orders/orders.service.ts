import * as crypto from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}


  private handlePrismaError(e: unknown, entity = 'Record'): never {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException(`${entity} not found`);
    }
    throw e;
  }


  async findAll() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return { message: 'Orders retrieved successfully', data: orders };
  }

  async findOne(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return { message: 'Order retrieved successfully', data: order };
  }

  async create(dto: CreateOrderDto) {
    const { orderId: _, items, ...orderData } = dto;
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        orderId: crypto.randomUUID(),
        status: orderData.status ?? 'pending',
        items: { create: items },
      },
      include: { items: true },
    });
    return { message: 'Order created successfully', data: order };
  }

  async update(orderId: string, dto: UpdateOrderDto) {
    try {
      const order = await this.prisma.order.update({
        where: { orderId },
        data: dto,
        include: { items: true },
      });
      return { message: 'Order updated successfully', data: order };
    } catch (e) {
      this.handlePrismaError(e, 'Order');
    }
  }

  async remove(orderId: string) {
    try {
      const order = await this.prisma.order.delete({
        where: { orderId },
        select: { orderId: true, status: true, totalAmount: true },
      });
      return { message: 'Order deleted successfully', data: order };
    } catch (e) {
      this.handlePrismaError(e, 'Order');
    }
  }
}