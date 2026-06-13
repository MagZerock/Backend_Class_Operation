import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireUser(userId?: string) {
    if (!userId) throw new UnauthorizedException('Missing x-user-id header');
    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { userId: true },
    });
    if (!user) throw new UnauthorizedException('Invalid user');
  }

  private validateDishId(dishId?: string) {
    if (!dishId) throw new BadRequestException('dish_id is required');
  }

  private validateQuantity(quantity?: number) {
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('Quantity must be an integer greater than zero');
    }
  }

  private async buildCartResponse(userId: string) {
    const cart = await this.prisma.shoppingCart.findUnique({
      where: { userId },
      include: { items: { include: { item: true } } },
    });

    if (!cart) return { userId, items: [], total: 0 };

    return {
      ...cart,
      total: cart.items.reduce(
        (sum, cartItem) => sum + Number(cartItem.item.price) * cartItem.quantity,
        0,
      ),
    };
  }

  async viewCart(userId: string) {
    await this.requireUser(userId);
    const data = await this.buildCartResponse(userId);
    return { message: 'Cart retrieved successfully', data };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    await this.requireUser(userId);
    this.validateDishId(dto.dish_id);
    this.validateQuantity(dto.quantity);

    const dish = await this.prisma.menuItem.findUnique({
      where: { itemId: dto.dish_id },
    });
    if (!dish) throw new NotFoundException('Dish not found');

    await this.prisma.shoppingCart.upsert({
      where: { userId },
      create: { userId },
      update: { updatedAt: new Date() },
    });

    await this.prisma.shoppingCartItem.upsert({
      where: { userId_itemId: { userId, itemId: dto.dish_id } },
      create: { userId, itemId: dto.dish_id, quantity: dto.quantity },
      update: { quantity: { increment: dto.quantity } },
    });

    const data = await this.buildCartResponse(userId);
    return { message: 'Item added to cart successfully', data };
  }

  async updateItem(userId: string, dishId: string, dto: UpdateCartItemDto) {
    await this.requireUser(userId);
    this.validateQuantity(dto.quantity);

    const existing = await this.prisma.shoppingCartItem.findUnique({
      where: { userId_itemId: { userId, itemId: dishId } },
    });
    if (!existing) throw new NotFoundException('Cart item not found');

    await this.prisma.shoppingCartItem.update({
      where: { userId_itemId: { userId, itemId: dishId } },
      data: { quantity: dto.quantity },
    });

    await this.prisma.shoppingCart.update({
      where: { userId },
      data: { updatedAt: new Date() },
    });

    const data = await this.buildCartResponse(userId);
    return { message: 'Cart item updated successfully', data };
  }

  async removeItem(userId: string, dishId: string) {
    await this.requireUser(userId);

    const deleted = await this.prisma.shoppingCartItem.deleteMany({
      where: { userId, itemId: dishId },
    });
    if (deleted.count === 0) throw new NotFoundException('Cart item not found');

    await this.prisma.shoppingCart.updateMany({
      where: { userId },
      data: { updatedAt: new Date() },
    });
  }

  async clearCart(userId: string) {
    await this.requireUser(userId);
    await this.prisma.shoppingCartItem.deleteMany({ where: { userId } });
    await this.prisma.shoppingCart.deleteMany({ where: { userId } });
  }
}