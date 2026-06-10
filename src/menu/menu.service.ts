import * as crypto from "crypto";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDishDto } from "./dto/create-dish.dto";
import { UpdateDishDto } from "./dto/update-dish.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";
import { AddIngredientDto } from "./dto/add-ingredient.dto";

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getDishes() {
    return this.prisma.menuItem.findMany();
  }

  async getDish(dishId: string) {
    return this.prisma.menuItem.findUnique({ where: { itemId: dishId } });
  }

  async createDish(dto: CreateDishDto) {
    return this.prisma.menuItem.create({
      data: { ...dto, itemId: crypto.randomUUID() },
    });
  }

  async updateDish(dishId: string, dto: UpdateDishDto) {
    return this.prisma.menuItem.update({ where: { itemId: dishId }, data: dto });
  }

  async deleteDish(dishId: string) {
    return this.prisma.menuItem.delete({ where: { itemId: dishId } });
  }

  async updateAvailability(dishId: string, dto: UpdateAvailabilityDto) {
    return this.prisma.menuItem.update({
      where: { itemId: dishId },
      data: { isAvailable: dto.isAvailable, availabilityReason: dto.availabilityReason },
    });
  }

  async addIngredient(dishId: string, dto: AddIngredientDto) {
    return this.prisma.menuItemIngredient.create({
      data: { itemId: dishId, skuCode: dto.skuCode, quantityRequired: dto.quantityRequired },
    });
  }

  async removeIngredient(dishId: string, sku: string) {
    return this.prisma.menuItemIngredient.delete({
      where: { itemId_skuCode: { itemId: dishId, skuCode: sku } },
    });
  }

  async getCategories() {
    return this.prisma.menuCategory.findMany();
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.menuCategory.create({
      data: { ...dto, categoryId: crypto.randomUUID() },
    });
  }

  async updateCategory(categoryId: string, dto: UpdateCategoryDto) {
    return this.prisma.menuCategory.update({ where: { categoryId }, data: dto });
  }

  async getIngredients() {
    return this.prisma.ingredient.findMany();
  }
}
