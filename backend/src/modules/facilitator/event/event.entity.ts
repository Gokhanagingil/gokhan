import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  INCIDENT = 'incident',
  REQUEST = 'request',
  CHANGE = 'change',
  AGILE_TASK = 'agile-task',
  PROBLEM = 'problem',
}

export enum EventStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('events')
export class Event {
  @ApiProperty({ description: 'Unique identifier for the event' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ enum: EventType, description: 'Type of the event' })
  @Column({
    type: 'varchar',
    enum: EventType,
  })
  type: EventType;

  @ApiProperty({ description: 'Title of the event' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Detailed description of the event' })
  @Column('text')
  description: string;

  @ApiProperty({ description: 'When the event was triggered' })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  triggeredAt: Date;

  @ApiProperty({
    enum: EventStatus,
    description: 'Current status of the event',
  })
  @Column({
    type: 'varchar',
    enum: EventStatus,
    default: EventStatus.OPEN,
  })
  status: EventStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
