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
import { InventoryService } from "./inventory.service";
import { CreateInventoryItemDto } from "./dto/create-inventory-item.dto";
import { UpdateInventoryItemDto } from "./dto/update-inventory-item.dto";

@Controller("inventory")
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Headers("x-user-id") userId: string) {
    return this.inventoryService.findAll(userId);
  }

  @Get(":inventoryId")
  findOne(@Headers("x-user-id") userId: string, @Param("inventoryId") inventoryId: string) {
    return this.inventoryService.findOne(userId, inventoryId);
  }

  @Post()
  create(@Headers("x-user-id") userId: string, @Body() dto: CreateInventoryItemDto) {
    return this.inventoryService.create(userId, dto);
  }

  @Put(":inventoryId")
  updatePut(
    @Headers("x-user-id") userId: string,
    @Param("inventoryId") inventoryId: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.update(userId, inventoryId, dto);
  }

  @Patch(":inventoryId")
  updatePatch(
    @Headers("x-user-id") userId: string,
    @Param("inventoryId") inventoryId: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.inventoryService.update(userId, inventoryId, dto);
  }

  @Delete(":inventoryId")
  @HttpCode(204)
  remove(@Headers("x-user-id") userId: string, @Param("inventoryId") inventoryId: string) {
    return this.inventoryService.remove(userId, inventoryId);
  }
}
