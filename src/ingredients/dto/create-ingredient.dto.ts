import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Min(0)
  unit_cost: number;
}
