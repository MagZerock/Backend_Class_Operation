import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { IngredientsService } from "./ingredients.service";
import { CreateIngredientDto } from "./dto/create-ingredient.dto";
import { UpdateIngredientDto } from "./dto/update-ingredient.dto";

@Controller("ingredients")
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  findAll(@Query("name") name?: string, @Query("category") category?: string) {
    return this.ingredientsService.findAll({ name, category });
  }

  @Get(":ingredientId")
  findOne(@Param("ingredientId") ingredientId: string) {
    return this.ingredientsService.findOne(ingredientId);
  }

  @Post()
  create(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(dto);
  }

  @Put(":ingredientId")
  updatePut(@Param("ingredientId") ingredientId: string, @Body() dto: UpdateIngredientDto) {
    return this.ingredientsService.update(ingredientId, dto);
  }

  @Patch(":ingredientId")
  updatePatch(@Param("ingredientId") ingredientId: string, @Body() dto: UpdateIngredientDto) {
    return this.ingredientsService.update(ingredientId, dto);
  }

  @Delete(":ingredientId")
  @HttpCode(204)
  remove(@Param("ingredientId") ingredientId: string) {
    return this.ingredientsService.remove(ingredientId);
  }
}
