import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum ParticipantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  AI_CONTROLLED = 'ai-controlled',
}

@Entity('participants')
export class Participant {
  @ApiProperty({ description: 'Unique identifier for the participant' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Name of the participant' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Role of the participant in the simulation' })
  @Column()
  role: string;

  @ApiProperty({ description: 'Last time the participant was active' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActive: Date;

  @ApiProperty({
    enum: ParticipantStatus,
    description: 'Current status of the participant',
  })
  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.ACTIVE,
  })
  status: ParticipantStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
