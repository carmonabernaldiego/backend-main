import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Printer } from './printer.entity';

@Injectable()
export class PrinterService {
  constructor(
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
  ) {}

  async findAll(): Promise<Printer[]> {
    try {
      return await this.printerRepository.find();
    } catch (error) {
      throw new NotFoundException('Error retrieving printers');
    }
  }

  async findOneById(id: number): Promise<Printer> {
    const printer = await this.printerRepository.findOne({
      where: { printer_id: id },
    });
    if (!printer) {
      throw new NotFoundException(`Printer with ID ${id} not found`);
    }
    return printer;
  }

  async findAllBySearch(search: string): Promise<Printer[]> {
    const printers = await this.printerRepository
      .createQueryBuilder('printer')
      .where('printer.printer_name LIKE :search', { search: `%${search}%` })
      .orWhere('printer.model LIKE :search', { search: `%${search}%` })
      .orWhere('printer.location LIKE :search', { search: `%${search}%` })
      .orWhere('printer.status LIKE :search', { search: `%${search}%` })
      .orWhere('printer.ip_address LIKE :search', { search: `%${search}%` })
      .orWhere('printer.serial_number LIKE :search', { search: `%${search}%` })
      .getMany();

    if (!printers || printers.length === 0) {
      throw new NotFoundException(
        `No printers found matching the search term "${search}"`,
      );
    }

    return printers;
  }

  async create(printer: Printer): Promise<Printer> {
    try {
      return await this.printerRepository.save(printer);
    } catch (error) {
      throw new Error('Error creating printer');
    }
  }

  async update(id: number, printer: Printer): Promise<Printer> {
    const existingPrinter = await this.findOneById(id); // Verificar si existe primero
    if (!existingPrinter) {
      throw new NotFoundException(`Printer with ID ${id} not found`);
    }

    try {
      await this.printerRepository.update(id, printer);
      return this.findOneById(id); // Retorna la impresora actualizada
    } catch (error) {
      throw new Error('Error updating printer');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const existingPrinter = await this.findOneById(id); // Verificar si existe primero
    if (!existingPrinter) {
      throw new NotFoundException(`Printer with ID ${id} not found`);
    }

    try {
      await this.printerRepository.delete(id);
      return { message: `Printer with ID ${id} deleted successfully` };
    } catch (error) {
      throw new Error('Error deleting printer');
    }
  }
}
