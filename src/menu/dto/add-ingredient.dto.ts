import { IsString, IsNotEmpty, IsNumber, Min } from "class-validator";

export class AddIngredientDto {
  @IsString()
  @IsNotEmpty()
  skuCode: string;

  @IsNumber()
  @Min(0)
  quantityRequired: number;
}
