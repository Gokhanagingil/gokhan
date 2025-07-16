import { Injectable } from '@nestjs/common';
import { Participant } from './participant.entity';

@Injectable()
export class ParticipantService {
  private participants: Participant[] = [
    { id: 1, name: 'Alice', isOnline: true },
    { id: 2, name: 'Bob', isOnline: false },
  ];

  findAll(): Participant[] {
    return this.participants;
  }
}
