import { IsOptional, IsString, IsNumber, Min } from "class-validator";

export class UpdateOrderDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  deliveryType?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
