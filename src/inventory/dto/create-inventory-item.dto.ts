import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  ingredient_name: string;

  @IsNumber()
  @Min(0)
  current_stock: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Min(0)
  reorder_level: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsNumber()
  @Min(0)
  unit_cost: number;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;
}
