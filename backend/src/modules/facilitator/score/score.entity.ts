import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Participant } from '../participant/participant.entity';

@Entity('scores')
export class Score {
  @ApiProperty({ description: 'Unique identifier for the score' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the participant being scored' })
  @Column('uuid')
  participantId: string;

  @ApiProperty({ description: 'Numeric score value' })
  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @ApiProperty({ description: 'Reason for the score' })
  @Column('text')
  reason: string;

  @ApiProperty({ description: 'When the score was recorded' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => Participant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participantId' })
  participant: Participant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
