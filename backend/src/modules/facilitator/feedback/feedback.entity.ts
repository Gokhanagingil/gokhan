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

@Entity('feedback')
export class Feedback {
  @ApiProperty({ description: 'Unique identifier for the feedback' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the participant receiving feedback' })
  @Column('uuid')
  participantId: string;

  @ApiProperty({ description: 'Feedback message content' })
  @Column('text')
  message: string;

  @ApiProperty({ description: 'When the feedback was sent' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @ManyToOne(() => Participant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'participantId' })
  participant: Participant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
