import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/queue',
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QueueGateway.name);
  private connectedClients = new Map<string, { userId: string; centerId?: string; role: string }>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private queueService: QueueService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });
      
      this.connectedClients.set(client.id, {
        userId: payload.sub,
        role: payload.role,
      });

      this.logger.log(`Client connected: ${client.id} (User: ${payload.sub}, Role: ${payload.role})`);
      client.emit('connected', { success: true, message: 'Connected to queue service' });
    } catch (error) {
      this.logger.warn(`Invalid token for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:center')
  async handleSubscribeCenter(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { centerId: string },
  ) {
    const clientInfo = this.connectedClients.get(client.id);
    if (!clientInfo) {
      return { success: false, message: 'Not authenticated' };
    }

    const center = await this.queueService['prisma'].procurementCenter.findUnique({
      where: { id: data.centerId },
    });

    if (!center) {
      return { success: false, message: 'Center not found' };
    }

    client.join(`center:${data.centerId}`);
    this.connectedClients.set(client.id, { ...clientInfo, centerId: data.centerId });

    const queueStatus = await this.queueService.getQueueStatus(data.centerId);
    client.emit('queue:status', queueStatus);

    this.logger.log(`Client ${client.id} subscribed to center ${data.centerId}`);
    return { success: true, message: `Subscribed to center ${data.centerId}` };
  }

  @SubscribeMessage('unsubscribe:center')
  async handleUnsubscribeCenter(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { centerId: string },
  ) {
    client.leave(`center:${data.centerId}`);
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo?.centerId === data.centerId) {
      this.connectedClients.set(client.id, { ...clientInfo, centerId: undefined });
    }
    return { success: true, message: `Unsubscribed from center ${data.centerId}` };
  }

  @SubscribeMessage('get:queue:status')
  async handleGetQueueStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { centerId: string },
  ) {
    const queueStatus = await this.queueService.getQueueStatus(data.centerId);
    return { success: true, data: queueStatus };
  }

  async broadcastQueueUpdate(centerId: string): Promise<void> {
    const queueStatus = await this.queueService.getQueueStatus(centerId);
    this.server.to(`center:${centerId}`).emit('queue:updated', queueStatus);
    this.logger.debug(`Broadcasted queue update for center ${centerId}`);
  }

  async broadcastTokenCalled(centerId: string, token: any): Promise<void> {
    this.server.to(`center:${centerId}`).emit('token:called', { token, timestamp: new Date().toISOString() });
    this.logger.debug(`Broadcasted token called for center ${centerId}: ${token.tokenNumber}`);
  }

  async broadcastTokenCompleted(centerId: string, token: any): Promise<void> {
    this.server.to(`center:${centerId}`).emit('token:completed', { token, timestamp: new Date().toISOString() });
  }

  async sendToFarmer(farmerUserId: string, event: string, data: any): Promise<void> {
    for (const [clientId, info] of this.connectedClients.entries()) {
      if (info.userId === farmerUserId) {
        this.server.to(clientId).emit(event, data);
      }
    }
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getCenterSubscribers(centerId: string): number {
    const room = this.server.sockets.adapter.rooms.get(`center:${centerId}`);
    return room ? room.size : 0;
  }
}