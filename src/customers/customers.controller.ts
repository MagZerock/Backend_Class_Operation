import { Controller, Get, Put, Patch, Param, Body } from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Put(":customerId")
  update(@Param("customerId") customerId: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(customerId, dto);
  }

  @Get(":customerId/orders")
  getOrders(@Param("customerId") customerId: string) {
    return this.customersService.getOrders(customerId);
  }

  @Patch(":customerId/preferences")
  updatePreferences(@Param("customerId") customerId: string, @Body() dto: UpdatePreferencesDto) {
    return this.customersService.updatePreferences(customerId, dto);
  }
}
