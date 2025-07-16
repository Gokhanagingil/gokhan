import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateScoreDto {
  @ApiProperty({ description: 'ID of the participant being scored' })
  @IsUUID()
  participantId: string;

  @ApiProperty({ description: 'Numeric score value' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Reason for the score' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'When the score was recorded', required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;
}
