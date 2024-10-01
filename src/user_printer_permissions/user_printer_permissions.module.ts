import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPrinterPermissionsService } from './user_printer_permissions.service';
import { UserPrinterPermissionsController } from './user_printer_permissions.controller';
import { UserPrinterPermission } from './user_printer_permissions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPrinterPermission])],
  providers: [UserPrinterPermissionsService],
  controllers: [UserPrinterPermissionsController],
})
export class UserPrinterPermissionsModule {}
