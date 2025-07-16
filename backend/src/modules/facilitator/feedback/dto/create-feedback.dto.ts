import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({ description: 'ID of the participant receiving feedback' })
  @IsUUID()
  participantId: string;

  @ApiProperty({ description: 'Feedback message content' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'When the feedback was sent', required: false })
  @IsOptional()
  @IsDateString()
  sentAt?: Date;
}
