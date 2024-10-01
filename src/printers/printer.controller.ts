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
import { PrinterService } from './printer.service';
import { Printer } from './printer.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('printers')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(): Promise<Printer[]> {
    return this.printerService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Printer> {
    return this.printerService.findOneById(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search/:search')
  findAllBySearch(@Param('search') search: string): Promise<Printer[]> {
    return this.printerService.findAllBySearch(search);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() printer: Printer): Promise<Printer> {
    return this.printerService.create(printer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Body() printer: Printer): Promise<Printer> {
    return this.printerService.update(+id, printer);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.printerService.remove(+id);
  }
}
