import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min } from "class-validator";

export class CreateDishDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsOptional()
  @IsString()
  availabilityReason?: string;
}
