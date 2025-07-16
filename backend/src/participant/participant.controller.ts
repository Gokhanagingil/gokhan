import { Controller, Get } from '@nestjs/common';
import { ParticipantService } from './participant.service';
import { Participant } from './participant.entity';

@Controller('participants')
export class ParticipantController {
  constructor(private readonly participantService: ParticipantService) {}

  @Get()
  findAll(): Participant[] {
    return this.participantService.findAll();
  }
}
