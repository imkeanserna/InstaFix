import { addBooking, updateBooking } from "../action/booking";
import { z } from "zod";
import { getPostById } from "../action/post";
import { BookingEventType, BookingStatus, Post } from "@prisma/client/edge";
import { AuthenticatedWebSocket } from "..";
import { DirectMessagingPubSub } from "../pubsub/redisClient";
import { BookingPayload, MessageType, NotificationType, TypeBookingNotification, TypeEventUpdate } from "@repo/types";
import { addBookingNotification } from "../action/notification";

const createBookingSchema = z.object({
  date: z.string().datetime(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  description: z.string()
    .min(5, "Description must be at least 5 characters long")
    .max(500, "Description must not exceed 500 characters")
    .trim(),
  quantity: z.number().positive(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export interface BookingEvent {
  type: BookingEventType;
  payload: any;
}

export class BookingManager {
  private messagingService: DirectMessagingPubSub;

  constructor() {
    this.messagingService = DirectMessagingPubSub.getInstance();
  }

  public async handleBookingEvent(user: AuthenticatedWebSocket, message: BookingEvent): Promise<void> {
    const { type, payload } = message;

    try {
      switch (type as BookingEventType) {
        case BookingEventType.CREATED:
          await this.handleAddBooking(user, payload);
          break;
        case BookingEventType.CANCELLED:
        case BookingEventType.RESCHEDULED:
        case BookingEventType.CONFIRMED:
        case BookingEventType.DECLINED:
          await this.handleEventUpdate(user, {
            ...payload,
            bookingEventType: type,
            status: this.getStatusForEventType(type),
          })
          break;
        case BookingEventType.UPDATED:
          break;
        default:
          throw new Error('Invalid event type');
      }
    } catch (error) {
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async handleAddBooking(user: AuthenticatedWebSocket, data: BookingPayload) {
    try {
      const postId = data.postId;
      if (!postId) {
        throw new Error('Post id is required');
      }

      const validatedData = createBookingSchema.parse(data);
      const post = await this.validatePost({ postId });

      if (post.userId === user.userId) {
        throw new Error('Cannot book your own service');
      }

      const result = await addBooking({
        data: validatedData,
        post: post,
        userId: user.userId
      });

      const notificationRecipient = this.getNotificationRecipient(
        BookingEventType.CREATED,
        result.clientId,
        result.freelancerId
      )

      const notification: TypeBookingNotification = await addBookingNotification({
        bookingId: result.id,
        userId: notificationRecipient,
        type: BookingEventType.CREATED
      });

      this.messagingService.notifyUsers(
        MessageType.NOTIFICATION,
        NotificationType.BOOKING,
        notification,
        notificationRecipient
      )

      this.messagingService.notifyUsers(
        MessageType.BOOKING,
        BookingEventType.CREATED,
        result,
        user.userId
      )
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async handleEventUpdate(user: AuthenticatedWebSocket, data: TypeEventUpdate): Promise<void> {
    try {
      if (!data.bookingId) {
        throw new Error('Booking id is required');
      }

      if (!data.clientId) {
        throw new Error('Client id is required');
      }

      if (!data.freelancerId) {
        throw new Error('Freelancer id is required');
      }

      const updatedBooking = await updateBooking({
        bookingId: data.bookingId,
        clientId: data.clientId,
        freelancerId: data.freelancerId,
        status: data.status
      });

      // RESCHEDULED - freelancer
      // CANCELLED - freelancer
      // CONFIRMED - client
      // DECLINED - client
      const notificationRecipient = this.getNotificationRecipient(
        data.bookingEventType,
        updatedBooking.clientId,
        updatedBooking.freelancerId
      )

      const notification: TypeBookingNotification = await addBookingNotification({
        bookingId: updatedBooking.id,
        userId: notificationRecipient,
        type: data.bookingEventType
      });

      console.log("NOTIFICATION")
      console.log(notification)

      this.messagingService.notifyUsers(
        MessageType.NOTIFICATION,
        NotificationType.BOOKING,
        notification,
        notificationRecipient
      );

      this.messagingService.notifyUsers(
        MessageType.BOOKING,
        data.bookingEventType,
        updatedBooking,
        user.userId
      );
    } catch (error) {
      console.error(error);
      this.messagingService.handleError(error, user.userId);
    }
  }

  private async validatePost({ postId }: { postId: string; }) {
    try {
      const post: Post | null = (await getPostById({ postId })) ?? null;
      if (!post) {
        throw new Error('POST_NOT_FOUND');
      }
      return post;
    } catch (error) {
      throw new Error('Invalid post id');
    }
  }

  private getNotificationRecipient(eventType: BookingEventType, clientId: string, freelancerId: string): string {
    const recipientMap: Record<BookingEventType, string> = {
      [BookingEventType.RESCHEDULED]: freelancerId,
      [BookingEventType.CANCELLED]: freelancerId,
      [BookingEventType.CONFIRMED]: clientId,
      [BookingEventType.DECLINED]: clientId,
      [BookingEventType.CREATED]: freelancerId,
      [BookingEventType.UPDATED]: freelancerId,
    };

    const recipientId = recipientMap[eventType];
    if (!recipientId) {
      throw new Error(`No notification recipient defined for event type: ${eventType}`);
    }

    return recipientId;
  }

  private getStatusForEventType(eventType: BookingEventType): BookingStatus {
    const statusMap: Record<BookingEventType, BookingStatus> = {
      [BookingEventType.CANCELLED]: BookingStatus.CANCELLED,
      [BookingEventType.CONFIRMED]: BookingStatus.CONFIRMED,
      [BookingEventType.DECLINED]: BookingStatus.DECLINED,
      [BookingEventType.RESCHEDULED]: BookingStatus.PENDING,
      [BookingEventType.CREATED]: BookingStatus.PENDING,
      [BookingEventType.UPDATED]: BookingStatus.PENDING,
    };

    const status = statusMap[eventType];
    if (!status) {
      throw new Error(`No status defined for event type: ${eventType}`);
    }

    return status;
  }
}
