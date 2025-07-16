import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ParticipantStatus } from '../participant.entity';

export class CreateParticipantDto {
  @ApiProperty({ description: 'Name of the participant' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Role of the participant in the simulation' })
  @IsString()
  role: string;

  @ApiProperty({
    description: 'Last time the participant was active',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  lastActive?: Date;

  @ApiProperty({
    enum: ParticipantStatus,
    description: 'Current status of the participant',
    required: false,
  })
  @IsOptional()
  @IsEnum(ParticipantStatus)
  status?: ParticipantStatus;
}
