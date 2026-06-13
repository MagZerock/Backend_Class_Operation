import * as crypto from "crypto";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateIngredientDto } from "./dto/create-ingredient.dto";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto";

type IngredientFilters = {
  name?: string;
  category?: string;
};

@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: IngredientFilters) {
    const where: Prisma.IngredientWhereInput = {};

    if (filters.name) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }

    if (filters.category) {
      where.category = { equals: filters.category, mode: "insensitive" };
    }

    return this.prisma.ingredient.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async findOne(ingredientId: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { skuCode: ingredientId },
    });

    if (!ingredient) {
      throw new NotFoundException("Ingredient not found");
    }

    return ingredient;
  }

  async create(dto: CreateIngredientDto) {
    if (!dto.name || !dto.unit) {
      throw new BadRequestException("name and unit are required");
    }

    if (typeof dto.unit_cost !== "number" || dto.unit_cost < 0) {
      throw new UnprocessableEntityException("unit_cost must be a non-negative number");
    }

    try {
      return await this.prisma.ingredient.create({
        data: {
          skuCode: crypto.randomUUID(),
          name: dto.name,
          category: dto.category,
          description: dto.description,
          unitOfMeasurement: dto.unit,
          unitCost: dto.unit_cost,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(ingredientId: string, dto: UpdateIngredientDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException("At least one field is required");
    }

    const existing = await this.prisma.ingredient.findUnique({
      where: { skuCode: ingredientId },
    });

    if (!existing) {
      throw new NotFoundException("Ingredient not found");
    }

    if (dto.unit_cost !== undefined && (typeof dto.unit_cost !== "number" || dto.unit_cost < 0)) {
      throw new UnprocessableEntityException("unit_cost must be a non-negative number");
    }

    try {
      return await this.prisma.ingredient.update({
        where: { skuCode: ingredientId },
        data: {
          name: dto.name,
          category: dto.category,
          unitOfMeasurement: dto.unit,
          unitCost: dto.unit_cost,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(ingredientId: string) {
    const existing = await this.prisma.ingredient.findUnique({
      where: { skuCode: ingredientId },
    });

    if (!existing) {
      throw new NotFoundException("Ingredient not found");
    }

    try {
      await this.prisma.ingredient.delete({ where: { skuCode: ingredientId } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
        throw new ConflictException("Ingredient is currently in use");
      }
      throw error;
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002" || error.code === "P2003") {
        throw new UnprocessableEntityException("Ingredient data cannot be processed");
      }
    }
    throw error;
  }
}
