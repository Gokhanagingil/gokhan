import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum SessionStatus {
  ACTIVE = 'active',
  STOPPED = 'stopped',
}

@Entity('sessions')
export class Session {
  @ApiProperty({ description: 'Unique identifier for the session' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Session start timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @ApiProperty({ description: 'Session end timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @ApiProperty({ enum: SessionStatus, description: 'Current session status' })
  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.STOPPED })
  status: SessionStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
