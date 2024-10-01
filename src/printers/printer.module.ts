import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterService } from './printer.service';
import { PrinterController } from './printer.controller';
import { Printer } from './printer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Printer])],
  providers: [PrinterService],
  controllers: [PrinterController],
})
export class PrinterModule {}
