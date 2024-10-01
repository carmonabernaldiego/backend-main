import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserPrinterPermission {
  @PrimaryGeneratedColumn()
  permission_id: number;

  @Column()
  user_id: number;

  @Column()
  printer_id: number;

  @Column()
  access_level: string; // e.g., "full", "read-only"
}
