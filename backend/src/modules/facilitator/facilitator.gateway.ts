import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://facilitator-api-tunnel-sumlaml5.devinapps.com',
      /^https:\/\/.*\.devinapps\.com$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  },
})
export class FacilitatorGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  broadcastNewParticipant(participant: any) {
    this.server.emit('new-participant', participant);
  }

  broadcastNewEvent(event: any) {
    this.server.emit('new-event', event);
  }

  broadcastScoreUpdated(score: any) {
    this.server.emit('score-updated', score);
  }

  broadcastSessionUpdate(session: any) {
    this.server.emit('session-update', session);
  }
}
