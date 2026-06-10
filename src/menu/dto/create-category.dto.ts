import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
