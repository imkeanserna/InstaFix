import { WebSocket } from "ws";
import { addBooking } from "../action/booking";
import { z } from "zod";
import { getPostById } from "../action/post";
import { Post } from "@prisma/client/edge";
import { AuthenticatedWebSocket } from "..";
import { DirectMessagingPubSub } from "../pubsub/redisClient";

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

interface BookingPayload {
  postId: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  description: string;
  quantity: number;
}

export class User {
  public socket: WebSocket;
  public userId: string;

  constructor(socket: WebSocket, userId: string) {
    this.socket = socket;
    this.userId = userId;
  }
}

export enum BookingEventType {
  CREATE = 'CREATE',
  CANCEL = 'CANCEL',
  RESCHEDULE = 'RESCHEDULE',
  CONFIRM = 'CONFIRM',
}

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
        case BookingEventType.CREATE:
          await this.handleAddBooking(user, payload);
          break;
        case BookingEventType.CANCEL:
          break;
        case BookingEventType.RESCHEDULE:
          break;
        case BookingEventType.CONFIRM:
          break;
        default:
          throw new Error('Invalid event type');
      }
    } catch (error) {
      // --TODO: Make a good error handling here!
      console.error(error);
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
      })

      console.log(result);

      if (this.messagingService.isUserConnected(post.userId)) {
        this.messagingService.sendDirectMessage(post.userId, JSON.stringify({
          event: BookingEventType.CREATE,
          data: {
            ...validatedData
          }
        }));
      }

      this.messagingService.sendDirectMessage(user.userId, JSON.stringify({
        event: BookingEventType.CREATE,
        data: result
      }))
    } catch (error) {
      // --TODO: Make a good error handling here!
      console.error(error);
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
}
