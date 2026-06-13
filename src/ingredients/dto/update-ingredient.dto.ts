import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_cost?: number;
}
