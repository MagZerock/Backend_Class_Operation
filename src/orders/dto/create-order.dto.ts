import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, Min, ArrayMinSize } from "class-validator";

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  priceAtPurchase: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  @IsNotEmpty()
  deliveryType: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsArray()
  @ArrayMinSize(1)
  items: OrderItemDto[];
}
