import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Session } from './session.entity';

@ApiTags('session')
@Controller('session')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new session' })
  @ApiResponse({
    status: 201,
    description: 'Session started successfully',
    type: Session,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  start(): Promise<Session> {
    return this.sessionService.start();
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop the current session' })
  @ApiResponse({
    status: 200,
    description: 'Session stopped successfully',
    type: Session,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  stop(): Promise<Session | null> {
    return this.sessionService.stop();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current session status' })
  @ApiResponse({
    status: 200,
    description: 'Current session status',
    type: Session,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getStatus(): Promise<Session | null> {
    return this.sessionService.getStatus();
  }
}
