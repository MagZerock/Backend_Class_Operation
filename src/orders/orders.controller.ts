import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(":orderId")
  findOne(@Param("orderId") orderId: string) {
    return this.ordersService.findOne(orderId);
  }

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Put(":orderId")
  update(@Param("orderId") orderId: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(orderId, dto);
  }

  @Delete(":orderId")
  remove(@Param("orderId") orderId: string) {
    return this.ordersService.remove(orderId);
  }
}
