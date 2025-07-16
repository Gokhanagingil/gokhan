import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantService } from './participant.service';
import { ParticipantController } from './participant.controller';
import { Participant } from './participant.entity';
import { FacilitatorGateway } from '../facilitator.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Participant])],
  controllers: [ParticipantController],
  providers: [ParticipantService, FacilitatorGateway],
  exports: [ParticipantService],
})
export class ParticipantModule {}
