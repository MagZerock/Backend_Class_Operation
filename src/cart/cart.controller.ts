import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  viewCart(@Headers("x-user-id") userId: string) {
    return this.cartService.viewCart(userId);
  }

  @Post("items")
  addItem(@Headers("x-user-id") userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Put("items/:dishId")
  updateItemPut(
    @Headers("x-user-id") userId: string,
    @Param("dishId") dishId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, dishId, dto);
  }

  @Patch("items/:dishId")
  updateItemPatch(
    @Headers("x-user-id") userId: string,
    @Param("dishId") dishId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, dishId, dto);
  }

  @Delete("items/:dishId")
  @HttpCode(204)
  removeItem(@Headers("x-user-id") userId: string, @Param("dishId") dishId: string) {
    return this.cartService.removeItem(userId, dishId);
  }

  @Delete()
  @HttpCode(204)
  clearCart(@Headers("x-user-id") userId: string) {
    return this.cartService.clearCart(userId);
  }
}
