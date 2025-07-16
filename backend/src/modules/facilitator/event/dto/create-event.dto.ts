import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventType, EventStatus } from '../event.entity';

export class CreateEventDto {
  @ApiProperty({ enum: EventType, description: 'Type of the event' })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'Title of the event' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Detailed description of the event' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'When the event was triggered', required: false })
  @IsOptional()
  @IsDateString()
  triggeredAt?: Date;

  @ApiProperty({
    enum: EventStatus,
    description: 'Current status of the event',
    required: false,
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}
