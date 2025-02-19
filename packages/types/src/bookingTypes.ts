import { BookingEventType, BookingStatus } from "@prisma/client/edge";

export type TypedBooking = {
  id: string;
  date: Date;
  status: string;
  client: {
    id: string;
  };
};

export enum MessageType {
  BOOKING = 'BOOKING',
  CHAT = 'CHAT',
  NOTIFICATION = 'NOTIFICATION',
  ERROR = 'ERROR'
}

export enum NotificationType {
  BOOKING = 'BOOKING',
  CHAT = 'CHAT',
}

export interface ErrorPayload {
  success: false;
  error: string;
  details?: string;
  status?: number;
}

export type BookingPayload = {
  postId: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  description: string;
  quantity: number;
}

export type TypeEventUpdate = {
  bookingId: string;
  clientId: string;
  freelancerId: string;
  status: BookingStatus;
  bookingEventType: BookingEventType;
}
