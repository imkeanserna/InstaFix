import { WebSocket } from "ws";

class User {
  public socket: WebSocket;
  public userId: string;

  constructor(socket: WebSocket, userId: string) {
    this.socket = socket;
    this.userId = userId;
  }
}

export enum BookingEventType {
  CREATE_APPOINTMENT = 'appointment:create',
  UPDATE_APPOINTMENT = 'appointment:update',
  CANCEL_APPOINTMENT = 'appointment:cancel',
  APPOINTMENT_CREATED = 'appointment:created',
  APPOINTMENT_UPDATED = 'appointment:updated',
  APPOINTMENT_CANCELLED = 'appointment:cancelled',
}

export interface BookingEvent {
  event: BookingEventType;
  payload: any;
}

export class BookingManager {
  constructor() {

  }

  public async handleBookingEvent(ws: User, message: BookingEvent): Promise<void> {
    const { event, payload } = message;
  }
}
