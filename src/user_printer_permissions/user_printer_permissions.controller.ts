import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserPrinterPermissionsService } from './user_printer_permissions.service';
import { UserPrinterPermission } from './user_printer_permissions.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('permissions')
export class UserPrinterPermissionsController {
  constructor(
    private readonly permissionService: UserPrinterPermissionsService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(): Promise<UserPrinterPermission[]> {
    return this.permissionService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserPrinterPermission> {
    return this.permissionService.findOneById(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @Body() permission: UserPrinterPermission,
  ): Promise<UserPrinterPermission> {
    return this.permissionService.create(permission);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() permission: UserPrinterPermission,
  ): Promise<UserPrinterPermission> {
    return this.permissionService.update(+id, permission);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.permissionService.remove(+id);
  }
}
