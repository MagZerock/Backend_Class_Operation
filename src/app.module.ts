import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { CustomersModule } from "./customers/customers.module";
import { MenuModule } from "./menu/menu.module";
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [PrismaModule, AuthModule, CustomersModule, MenuModule, OrdersModule],
})
export class AppModule {}
