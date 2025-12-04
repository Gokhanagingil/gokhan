import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
})
export class FacilitatorGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(FacilitatorGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(): void {
    this.logger.log(
      `WebSocket Gateway initialized with CORS origin: ${corsOrigin}`,
    );
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastNewParticipant(participant: unknown): void {
    this.server.emit('new-participant', participant);
    this.logger.debug(`Broadcast new-participant event`);
  }

  broadcastNewEvent(event: unknown): void {
    this.server.emit('new-event', event);
    this.logger.debug(`Broadcast new-event event`);
  }

  broadcastScoreUpdated(score: unknown): void {
    this.server.emit('score-updated', score);
    this.logger.debug(`Broadcast score-updated event`);
  }

  broadcastSessionUpdate(session: unknown): void {
    this.server.emit('session-update', session);
    this.logger.debug(`Broadcast session-update event`);
  }
}
