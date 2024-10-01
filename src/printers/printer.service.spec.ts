import { Test, TestingModule } from '@nestjs/testing';
import { PrinterService } from './printer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Printer } from './printer.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockPrinter = {
  printer_id: 1,
  printer_name: 'Printer 1',
  model: 'Model A',
  location: 'Location A',
  status: 'active',
  ip_address: '192.168.0.1',
  serial_number: 'SN12345',
};

describe('PrinterService', () => {
  let service: PrinterService;
  let repository: Repository<Printer>;

  const mockPrinterRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterService,
        {
          provide: getRepositoryToken(Printer),
          useValue: mockPrinterRepository,
        },
      ],
    }).compile();

    service = module.get<PrinterService>(PrinterService);
    repository = module.get<Repository<Printer>>(getRepositoryToken(Printer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of printers', async () => {
      mockPrinterRepository.find.mockResolvedValue([mockPrinter]);

      const printers = await service.findAll();
      expect(printers).toEqual([mockPrinter]);
      expect(mockPrinterRepository.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException if an error occurs', async () => {
      mockPrinterRepository.find.mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneById', () => {
    it('should return a printer by ID', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);

      const printer = await service.findOneById(1);
      expect(printer).toEqual(mockPrinter);
      expect(mockPrinterRepository.findOne).toHaveBeenCalledWith({
        where: { printer_id: 1 },
      });
    });

    it('should throw NotFoundException if printer not found', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllBySearch', () => {
    it('should return printers matching search criteria', async () => {
      mockPrinterRepository
        .createQueryBuilder()
        .getMany.mockResolvedValue([mockPrinter]);

      const printers = await service.findAllBySearch('Printer');
      expect(printers).toEqual([mockPrinter]);
    });

    it('should throw NotFoundException if no printers match the search', async () => {
      mockPrinterRepository.createQueryBuilder().getMany.mockResolvedValue([]);

      await expect(service.findAllBySearch('Nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a printer', async () => {
      mockPrinterRepository.save.mockResolvedValue(mockPrinter);

      const createdPrinter = await service.create(mockPrinter);
      expect(createdPrinter).toEqual(mockPrinter);
      expect(mockPrinterRepository.save).toHaveBeenCalledWith(mockPrinter);
    });

    it('should throw an error if creation fails', async () => {
      mockPrinterRepository.save.mockRejectedValue(new Error('Creation Error'));

      await expect(service.create(mockPrinter)).rejects.toThrow(
        'Error creating printer',
      );
    });
  });

  describe('update', () => {
    it('should update and return the printer', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrinterRepository.update.mockResolvedValue(undefined);
      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);

      const updatedPrinter = await service.update(1, mockPrinter);
      expect(updatedPrinter).toEqual(mockPrinter);
    });

    it('should throw NotFoundException if printer not found', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, mockPrinter)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error if update fails', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrinterRepository.update.mockRejectedValue(new Error('Update Error'));

      await expect(service.update(1, mockPrinter)).rejects.toThrow(
        'Error updating printer',
      );
    });
  });

  describe('remove', () => {
    it('should remove the printer and return a message', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrinterRepository.delete.mockResolvedValue({ affected: 1 });

      const response = await service.remove(1);
      expect(response).toEqual({
        message: 'Printer with ID 1 deleted successfully',
      });
    });

    it('should throw NotFoundException if printer not found', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if delete fails', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrinterRepository.delete.mockRejectedValue(new Error('Delete Error'));

      await expect(service.remove(1)).rejects.toThrow('Error deleting printer');
    });
  });
});
