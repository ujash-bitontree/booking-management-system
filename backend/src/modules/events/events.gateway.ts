import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const APPOINTMENT_EXPIRED_EVENT = 'appointment.expired';
export const APPOINTMENT_STATUS_CHANGED_EVENT = 'appointment.status.changed';

export interface AppointmentExpiredEvent {
  appointmentId: string;
  status: string;
}

@Injectable()
export class EventsGateway {
  private readonly logger = new Logger(EventsGateway.name);
  private connections: Map<string, Set<(data: string) => void>> = new Map();

  constructor(private readonly eventEmitter: EventEmitter2) { }

  addConnection(userId: string, send: (data: string) => void) {
    if (!this.connections.has(userId)) {
      this.connections.set(userId, new Set());
    }
    this.connections.get(userId)!.add(send);
    this.logger.log(`Added SSE connection for user ${userId}`);
  }

  removeConnection(userId: string, send: (data: string) => void) {
    const userConnections = this.connections.get(userId);
    if (userConnections) {
      userConnections.delete(send);
      if (userConnections.size === 0) {
        this.connections.delete(userId);
      }
    }
  }

  broadcastToUser(userId: string, event: string, data: any) {
    this.logger.log(`Broadcasting to user ${userId}, event: ${event}, data: ${JSON.stringify(data)}`);
    this.logger.log(`Active connections: ${Array.from(this.connections.keys()).join(', ')}`);

    const userConnections = this.connections.get(userId);
    if (userConnections) {
      // const payload = JSON.stringify({ event, data });
      // userConnections.forEach((send) => send(payload));
      const payload = {
        event,
        data,
      } as any;

      userConnections.forEach((send) => send(payload));
      this.logger.log(`Sent to ${userConnections.size} connection(s)`);
    } else {
      this.logger.warn(`No connections found for user ${userId}`);
    }
  }

  broadcastAppointmentExpired(appointmentId: string, userId: string, status: string) {
    this.logger.log(`broadcastAppointmentExpired called: appointmentId=${appointmentId}, userId=${userId}, status=${status}`);
    this.broadcastToUser(userId, APPOINTMENT_EXPIRED_EVENT, {
      appointmentId,
      status,
    });
  }

  broadcastStatusChange(appointmentId: string, userId: string, status: string) {
    this.broadcastToUser(userId, APPOINTMENT_STATUS_CHANGED_EVENT, {
      appointmentId,
      status,
    });
  }
}