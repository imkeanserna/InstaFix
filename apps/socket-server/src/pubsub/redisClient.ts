import { WebSocket } from "ws";
import { Redis } from "ioredis";
import { REDIS_URL } from "../config/config";

interface User {
  userId: string;
  ws: WebSocket;
}

export class DirectMessagingPubSub {
  private static instance: DirectMessagingPubSub;
  private subscriber: Redis;
  private publisher: Redis;
  private userChannels: Map<string, User>;

  private constructor() {
    this.subscriber = new Redis(REDIS_URL);
    this.publisher = new Redis(REDIS_URL);
    this.userChannels = new Map();

    this.subscriber.on("message", (channel: string, message: string) => {
      const userId = channel.split(':')[1];
      if (userId) {
        const user = this.userChannels.get(userId);
        if (user) {
          user.ws.send(message);
        }
      }
    });
  }

  static getInstance(): DirectMessagingPubSub {
    if (!DirectMessagingPubSub.instance) {
      DirectMessagingPubSub.instance = new DirectMessagingPubSub();
    }
    return DirectMessagingPubSub.instance;
  }

  connect(userId: string, ws: WebSocket): void {
    if (!userId) {
      console.error("User ID must be provided.");
      return;
    }

    const userChannel = `user:${userId}`;
    this.userChannels.set(userId, { userId, ws });

    // Subscribe to user's personal channel
    this.subscriber.subscribe(userChannel, (err, count) => {
      if (err) {
        console.error(`Failed to connect user: ${err.message}`);
      } else {
        console.log(`User ${userId} connected. Total connections: ${count}`);
      }
    });
  }

  disconnect(userId: string): void {
    if (!userId) return;

    const userChannel = `user:${userId}`;
    this.userChannels.delete(userId);
    this.subscriber.unsubscribe(userChannel);
    console.log(`User ${userId} disconnected`);
  }

  async sendDirectMessage(
    receiverId: string,
    payload: any
  ): Promise<void> {
    const receiverChannel = `user:${receiverId}`;
    await this.publish(receiverChannel, payload);
  }

  private async publish(channel: string, message: string): Promise<void> {
    console.log(`Sending message to ${channel}`);
    await this.publisher.publish(channel, message);
  }

  // Helper method to check if user is connected
  isUserConnected(userId: string): boolean {
    return this.userChannels.has(userId);
  }
}
