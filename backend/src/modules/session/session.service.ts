import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from './session.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
  ) {}

  async start(): Promise<Session> {
    await this.sessionRepository.update(
      { status: SessionStatus.ACTIVE },
      { status: SessionStatus.STOPPED, endedAt: new Date() },
    );

    const session = this.sessionRepository.create({
      startedAt: new Date(),
      status: SessionStatus.ACTIVE,
    });
    return this.sessionRepository.save(session);
  }

  async stop(): Promise<Session | null> {
    const activeSession = await this.sessionRepository.findOne({
      where: { status: SessionStatus.ACTIVE },
    });
    if (activeSession) {
      activeSession.endedAt = new Date();
      activeSession.status = SessionStatus.STOPPED;
      return this.sessionRepository.save(activeSession);
    }
    return null;
  }

  async getStatus(): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { status: SessionStatus.ACTIVE },
    });
  }
}
