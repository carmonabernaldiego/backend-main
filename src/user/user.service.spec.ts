import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = [new User()];
      jest.spyOn(repository, 'find').mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findOneById', () => {
    it('should return a user if found', async () => {
      const result = new User();
      jest.spyOn(repository, 'findOne').mockResolvedValue(result);

      expect(await service.findOneById(1)).toBe(result);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if found', async () => {
      const result = new User();
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(result);

      expect(await service.findOneByEmail('test@example.com')).toBe(result);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      expect(await service.findOneByEmail('test@example.com')).toBe(null);
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const user = new User();
      user.password_hash = 'plaintextPassword';
      const hashedUser = { ...user, password_hash: 'hashedPassword' };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(repository, 'save').mockResolvedValue(hashedUser);

      expect(await service.create(user)).toBe(hashedUser);
    });

    it('should throw ConflictException for missing fields', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue({ code: 'ER_NO_DEFAULT_FOR_FIELD' });

      await expect(service.create(new User())).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(service.create(new User())).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const existingUser = new User();
      const updatedUser = { ...existingUser, password_hash: 'newPassword' };

      jest.spyOn(service, 'findOneById').mockResolvedValue(existingUser);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(repository, 'findOne').mockResolvedValue(updatedUser);

      expect(await service.update(1, updatedUser)).toBe(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest
        .spyOn(service, 'findOneById')
        .mockRejectedValue(new NotFoundException());

      await expect(service.update(1, new User())).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException for missing fields', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(new User());
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest
        .spyOn(repository, 'update')
        .mockRejectedValue({ code: 'ER_NO_DEFAULT_FOR_FIELD' });

      await expect(service.update(1, new User())).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      jest.spyOn(service, 'findOneById').mockResolvedValue(new User());
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest
        .spyOn(repository, 'update')
        .mockRejectedValue({ code: 'ER_DUP_ENTRY' });

      await expect(service.update(1, new User())).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove the user and return a message', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: {} }); // Añadido el campo 'raw'

      expect(await service.remove(1)).toEqual({
        message: 'User with ID 1 deleted successfully',
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0, raw: {} }); // Añadido el campo 'raw'

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
