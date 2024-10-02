import { Test, TestingModule } from '@nestjs/testing';
import { UserPrinterPermissionsService } from './user_printer_permissions.service';
import { UserPrinterPermission } from './user_printer_permissions.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

describe('UserPrinterPermissionsService', () => {
  let service: UserPrinterPermissionsService;
  let repository: Repository<UserPrinterPermission>;

  const mockPermissionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserPrinterPermissionsService,
        {
          provide: getRepositoryToken(UserPrinterPermission),
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    service = module.get<UserPrinterPermissionsService>(
      UserPrinterPermissionsService,
    );
    repository = module.get<Repository<UserPrinterPermission>>(
      getRepositoryToken(UserPrinterPermission),
    );
  });

  describe('findAll', () => {
    it('should return an array of permissions', async () => {
      const result = [new UserPrinterPermission()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOneById', () => {
    it('should return a permission if found', async () => {
      const result = new UserPrinterPermission();
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      expect(await service.findOneById(1)).toBe(result);
    });

    it('should throw NotFoundException if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new permission', async () => {
      const permission = new UserPrinterPermission();
      jest.spyOn(repository, 'save').mockResolvedValue(permission);

      expect(await service.create(permission)).toBe(permission);
    });

    it('should throw ConflictException for missing fields', async () => {
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue({ code: 'ER_NO_DEFAULT_FOR_FIELD' });

      await expect(service.create(new UserPrinterPermission())).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException for duplicate entries', async () => {
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(service.create(new UserPrinterPermission())).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for invalid data', async () => {
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.create(new UserPrinterPermission())).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the permission', async () => {
      const existingPermission = new UserPrinterPermission();
      existingPermission.permission_id = 1; // Asegúrate de que esto esté configurado si es necesario

      const updatedPermission = new UserPrinterPermission();
      updatedPermission.permission_id = 1; // Debe tener la misma ID para que sea el mismo objeto

      jest.spyOn(service, 'findOneById').mockResolvedValue(existingPermission);
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedPermission);

      // Ahora verificamos que el objeto devuelto es el mismo que el esperado
      expect(await service.update(1, updatedPermission)).toStrictEqual(
        updatedPermission,
      );
    });

    it('should throw NotFoundException if permission does not exist', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException());

      await expect(
        service.update(1, new UserPrinterPermission()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the permission and return a message', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: {} }); // Añadido el campo 'raw'

      expect(await service.remove(1)).toEqual({
        message: 'Permission with ID 1 deleted successfully',
      });
    });

    it('should throw NotFoundException if permission does not exist', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0, raw: {} }); // Añadido el campo 'raw'

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
