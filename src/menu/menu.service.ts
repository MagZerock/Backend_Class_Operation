import * as crypto from 'crypto';
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AddIngredientDto } from './dto/add-ingredient.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  private handlePrismaError(e: unknown, entity = 'Record'): never {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException(`${entity} not found`);
      if (e.code === 'P2002') throw new ConflictException(`${entity} already exists`);
    }
    throw e;
  }

  async getDishes() {
    const dishes = await this.prisma.menuItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { message: 'Dishes retrieved successfully', data: dishes };
  }

  async getDish(dishId: string) {
    const dish = await this.prisma.menuItem.findUnique({
      where: { itemId: dishId },
    });
    if (!dish) throw new NotFoundException('Dish not found');
    return { message: 'Dish retrieved successfully', data: dish };
  }

  async createDish(dto: CreateDishDto) {
    const { itemId: _, ...rest } = dto; 
    const dish = await this.prisma.menuItem.create({
      data: { ...rest, itemId: crypto.randomUUID() },
    });
    return { message: 'Dish created successfully', data: dish };
  }

  async updateDish(dishId: string, dto: UpdateDishDto) {
    try {
      const dish = await this.prisma.menuItem.update({
        where: { itemId: dishId },
        data: dto,
      });
      return { message: 'Dish updated successfully', data: dish };
    } catch (e) {
      this.handlePrismaError(e, 'Dish');
    }
  }

  async deleteDish(dishId: string) {
    try {
      const dish = await this.prisma.menuItem.delete({
        where: { itemId: dishId },
        select: { itemId: true, name: true },
      });
      return { message: 'Dish deleted successfully', data: dish };
    } catch (e) {
      this.handlePrismaError(e, 'Dish');
    }
  }

  async updateAvailability(dishId: string, dto: UpdateAvailabilityDto) {
    try {
      const dish = await this.prisma.menuItem.update({
        where: { itemId: dishId },
        data: { isAvailable: dto.isAvailable, availabilityReason: dto.availabilityReason ?? null },
        select: { itemId: true, name: true, isAvailable: true, availabilityReason: true },
      });
      return { message: 'Dish availability updated successfully', data: dish };
    } catch (e) {
      this.handlePrismaError(e, 'Dish');
    }
  }

  async addIngredient(dishId: string, dto: AddIngredientDto) {
    try {
      const link = await this.prisma.menuItemIngredient.create({
        data: {
          itemId: dishId,
          skuCode: dto.skuCode,
          quantityRequired: dto.quantityRequired,
        },
      });
      return { message: 'Ingredient added to dish successfully', data: link };
    } catch (e) {
      this.handlePrismaError(e, 'Ingredient');
    }
  }

  async removeIngredient(dishId: string, sku: string) {
    try {
      const link = await this.prisma.menuItemIngredient.delete({
        where: { itemId_skuCode: { itemId: dishId, skuCode: sku } },
      });
      return { message: 'Ingredient removed from dish successfully', data: link };
    } catch (e) {
      this.handlePrismaError(e, 'Ingredient link');
    }
  }

  async getCategories() {
    const categories = await this.prisma.menuCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return { message: 'Categories retrieved successfully', data: categories };
  }

  async createCategory(dto: CreateCategoryDto) {
    const { categoryId: _, ...rest } = dto; // ignore categoryId from DTO, always generate
    const category = await this.prisma.menuCategory.create({
      data: { ...rest, categoryId: crypto.randomUUID() },
    });
    return { message: 'Category created successfully', data: category };
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.menuCategory.update({
        where: { categoryId },
        data: dto,
      });
      return { message: 'Category updated successfully', data: category };
    } catch (e) {
      this.handlePrismaError(e, 'Category');
    }
  }

  async getIngredients() {
    const ingredients = await this.prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
    });
    return { message: 'Ingredients retrieved successfully', data: ingredients };
  }
}