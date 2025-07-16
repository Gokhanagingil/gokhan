import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  FACILITATOR = 'facilitator',
  OBSERVER = 'observer',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Email address for login' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Hashed password' })
  @Column()
  password: string;

  @ApiProperty({ enum: UserRole, description: 'User role for access control' })
  @Column({ type: 'varchar', enum: UserRole, default: UserRole.OBSERVER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
