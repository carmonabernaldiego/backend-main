import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPrinterPermission } from './user_printer_permissions.entity';

@Injectable()
export class UserPrinterPermissionsService {
  constructor(
    @InjectRepository(UserPrinterPermission)
    private readonly permissionRepository: Repository<UserPrinterPermission>,
  ) {}

  async findAll(): Promise<UserPrinterPermission[]> {
    return this.permissionRepository.find();
  }

  async findOneById(id: number): Promise<UserPrinterPermission> {
    const permission = await this.permissionRepository.findOne({
      where: { permission_id: id },
    });
    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return permission;
  }

  async create(
    permission: UserPrinterPermission,
  ): Promise<UserPrinterPermission> {
    try {
      return await this.permissionRepository.save(permission);
    } catch (error) {
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        throw new ConflictException(
          'Missing required field(s) in permission data',
        );
      } else if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Permission already exists');
      }
      throw new BadRequestException('Invalid data provided');
    }
  }

  async update(
    id: number,
    permission: UserPrinterPermission,
  ): Promise<UserPrinterPermission> {
    const existingPermission = await this.findOneById(id);
    try {
      await this.permissionRepository.update(id, permission);
      return this.findOneById(id); // Esto debería devolver el objeto actualizado
    } catch (error) {
      if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
        throw new ConflictException(
          'Missing required field(s) in permission data',
        );
      } else if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Permission already exists');
      }
      throw new BadRequestException('Invalid data provided');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.permissionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
    return { message: `Permission with ID ${id} deleted successfully` };
  }
}
