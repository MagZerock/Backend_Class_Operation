import * as crypto from "crypto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    await this.requireAdmin(userId);
    return this.prisma.inventory.findMany({ include: { ingredient: true } });
  }

  async findOne(userId: string, inventoryId: string) {
    await this.requireAdmin(userId);

    const item = await this.prisma.inventory.findUnique({
      where: { inventoryId },
      include: { ingredient: true },
    });

    if (!item) {
      throw new NotFoundException("Inventory item not found");
    }

    return item;
  }

  async create(userId: string, dto: CreateInventoryItemDto) {
    await this.requireAdmin(userId);
    this.validateCreateDto(dto);

    const skuCode = crypto.randomUUID();

    try {
      return await this.prisma.inventory.create({
        data: {
          inventoryId: crypto.randomUUID(),
          currentStock: dto.current_stock,
          reorderLevel: dto.reorder_level,
          supplier: dto.supplier,
          expiryDate: dto.expiry_date ? new Date(dto.expiry_date) : null,
          ingredient: {
            create: {
              skuCode,
              name: dto.ingredient_name,
              unitOfMeasurement: dto.unit,
              unitCost: dto.unit_cost,
            },
          },
        },
        include: { ingredient: true },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(userId: string, inventoryId: string, dto: UpdateInventoryItemDto) {
    await this.requireAdmin(userId);
    this.validateUpdateDto(dto);

    const existing = await this.prisma.inventory.findUnique({ where: { inventoryId } });
    if (!existing) {
      throw new NotFoundException("Inventory item not found");
    }

    try {
      return await this.prisma.inventory.update({
        where: { inventoryId },
        data: {
          currentStock: dto.current_stock,
          reorderLevel: dto.reorder_level,
          expiryDate: dto.expiry_date ? new Date(dto.expiry_date) : undefined,
          updatedAt: new Date(),
        },
        include: { ingredient: true },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(userId: string, inventoryId: string) {
    await this.requireAdmin(userId);

    const existing = await this.prisma.inventory.findUnique({ where: { inventoryId } });
    if (!existing) {
      throw new NotFoundException("Inventory item not found");
    }

    try {
      await this.prisma.inventory.delete({ where: { inventoryId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new ConflictException("Inventory item is currently in use");
      }
      throw error;
    }
  }

  private async requireAdmin(userId?: string) {
    if (!userId) {
      throw new UnauthorizedException("Missing x-user-id header");
    }

    const user = await this.prisma.user.findUnique({
      where: { userId },
      select: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid user");
    }

    if (user.role !== "admin") {
      throw new ForbiddenException("Admin role required");
    }
  }

  private validateCreateDto(dto: CreateInventoryItemDto) {
    if (!dto.ingredient_name || !dto.unit) {
      throw new BadRequestException("ingredient_name and unit are required");
    }

    this.validateNonNegativeNumber(dto.current_stock, "current_stock");
    this.validateNonNegativeNumber(dto.reorder_level, "reorder_level");
    this.validateNonNegativeNumber(dto.unit_cost, "unit_cost");
    this.validateDate(dto.expiry_date);
  }

  private validateUpdateDto(dto: UpdateInventoryItemDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one field is required");
    }

    if (dto.current_stock !== undefined) {
      this.validateNonNegativeNumber(dto.current_stock, "current_stock");
    }

    if (dto.reorder_level !== undefined) {
      this.validateNonNegativeNumber(dto.reorder_level, "reorder_level");
    }

    this.validateDate(dto.expiry_date);
  }

  private validateNonNegativeNumber(value: number | undefined, field: string) {
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      throw new UnprocessableEntityException(`${field} must be a non-negative number`);
    }
  }

  private validateDate(value?: string) {
    if (value && Number.isNaN(new Date(value).getTime())) {
      throw new UnprocessableEntityException("expiry_date must be a valid date");
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" || error.code === "P2003") {
        throw new UnprocessableEntityException("Inventory data cannot be processed");
      }
    }

    throw error;
  }
}
