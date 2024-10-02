import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConflictException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    findOneByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = {
        user_id: 1,
        username: 'testuser',
        userlastname: 'Test Lastname',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 1, // Asumiendo que 'role' puede ser un número, como un ID de rol
      };
      const plainPassword = 'plaintextPassword';

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(user.email, plainPassword);
      expect(result).toEqual({
        user_id: user.user_id,
        username: user.username,
        userlastname: user.userlastname,
        email: user.email,
        role: user.role,
      });
    });

    it('should return null if user is not found', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      const result = await service.validateUser(
        'unknown@example.com',
        'password',
      );
      expect(result).toBe(null);
    });

    it('should return null if password is incorrect', async () => {
      const user = {
        user_id: 1,
        username: 'testuser',
        userlastname: 'Test Lastname',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 1,
      };
      const plainPassword = 'wrongPassword';

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = await service.validateUser(user.email, plainPassword);
      expect(result).toBe(null);
    });
  });

  describe('login', () => {
    it('should return a JWT access token and user ID', async () => {
      const user = {
        user_id: 1,
        username: 'testuser',
        userlastname: 'Test Lastname',
        email: 'test@example.com',
      };
      const payload = { email: user.email, sub: user.user_id };

      jest.spyOn(jwtService, 'sign').mockReturnValue('token');

      const result = await service.login(user);
      expect(result).toEqual({
        access_token: 'token',
        user_id: user.user_id,
      });
      expect(jwtService.sign).toHaveBeenCalledWith(payload);
    });
  });

  describe('register', () => {
    it('should call userService.create with the user data', async () => {
      const user = {
        user_id: 1,
        username: 'testuser',
        userlastname: 'Test Lastname',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 1,
      };
      jest.spyOn(userService, 'create').mockResolvedValue(user);

      const result = await service.register(user);
      expect(result).toBe(user);
      expect(userService.create).toHaveBeenCalledWith(user);
    });

    it('should throw ConflictException if there is an error creating the user', async () => {
      const user = {
        username: 'testuser',
        userlastname: 'Test Lastname',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 1,
      };
      jest
        .spyOn(userService, 'create')
        .mockRejectedValue(new ConflictException());

      await expect(service.register(user)).rejects.toThrow(ConflictException);
    });
  });
});
