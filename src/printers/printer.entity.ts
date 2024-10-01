import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Printer {
  @PrimaryGeneratedColumn()
  printer_id: number;

  @Column()
  printer_name: string;

  @Column()
  model: string;

  @Column()
  location: string;

  @Column()
  status: string;

  @Column()
  ip_address: string;

  @Column()
  serial_number: string;
}
