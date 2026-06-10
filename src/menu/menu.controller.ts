import {
  Controller, Get, Post, Put, Patch, Delete, Param, Body,
} from "@nestjs/common";
import { MenuService } from "./menu.service";
import { CreateDishDto } from "./dto/create-dish.dto";
import { UpdateDishDto } from "./dto/update-dish.dto";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";
import { AddIngredientDto } from "./dto/add-ingredient.dto";

@Controller("menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get("dishes")
  getDishes() {
    return this.menuService.getDishes();
  }

  @Get("dishes/:dishId")
  getDish(@Param("dishId") dishId: string) {
    return this.menuService.getDish(dishId);
  }

  @Post("dishes")
  createDish(@Body() dto: CreateDishDto) {
    return this.menuService.createDish(dto);
  }

  @Put("dishes/:dishId")
  updateDish(@Param("dishId") dishId: string, @Body() dto: UpdateDishDto) {
    return this.menuService.updateDish(dishId, dto);
  }

  @Delete("dishes/:dishId")
  deleteDish(@Param("dishId") dishId: string) {
    return this.menuService.deleteDish(dishId);
  }

  @Patch("dishes/:dishId/availability")
  updateAvailability(@Param("dishId") dishId: string, @Body() dto: UpdateAvailabilityDto) {
    return this.menuService.updateAvailability(dishId, dto);
  }

  @Post("dishes/:dishId/ingredients")
  addIngredient(@Param("dishId") dishId: string, @Body() dto: AddIngredientDto) {
    return this.menuService.addIngredient(dishId, dto);
  }

  @Delete("dishes/:dishId/ingredients/:sku")
  removeIngredient(@Param("dishId") dishId: string, @Param("sku") sku: string) {
    return this.menuService.removeIngredient(dishId, sku);
  }

  @Get("categories")
  getCategories() {
    return this.menuService.getCategories();
  }

  @Post("categories")
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.menuService.createCategory(dto);
  }

  @Put("categories/:categoryId")
  updateCategory(@Param("categoryId") categoryId: string, @Body() dto: UpdateCategoryDto) {
    return this.menuService.updateCategory(categoryId, dto);
  }

  @Get("ingredients")
  getIngredients() {
    return this.menuService.getIngredients();
  }
}
