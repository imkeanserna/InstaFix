import { createServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { BookingManager } from "./handlers/booking-manager";
import jwt from 'jsonwebtoken';
import url from 'url';
import { FRONTEND_URL, JWT_SECRET, SERVER_PORT } from "./config/config";
import { DirectMessagingPubSub } from "./pubsub/redisClient";
import { MessageType } from "@repo/types";

export interface AuthenticatedWebSocket extends WebSocket {
  userId: string;
}

class RealTimeServer {
  private server: ReturnType<typeof createServer>;
  private wss: WebSocketServer;
  private bookingManager: BookingManager;
  private messagingService: DirectMessagingPubSub;

  constructor() {
    this.server = createServer();
    this.wss = new WebSocketServer({
      server: this.server,
      verifyClient: this.verifyClient.bind(this)
    });
    this.bookingManager = new BookingManager();
    this.messagingService = DirectMessagingPubSub.getInstance();
  }

  private verifyClient(
    info: { origin: string; secure: boolean; req: IncomingMessage },
    callback: (verified: boolean, code?: number, message?: string) => void
  ): void {
    try {
      // Check allowed origins
      const allowedOrigins = [FRONTEND_URL, "http://localhost:3000"];
      if (!allowedOrigins.includes(info.origin)) {
        return callback(false, 403, "Origin not allowed");
      }

      // Get token from query parameter
      const { query } = url.parse(info.req.url!, true);
      const token = query.token as string;
      console.log("TTTTTTTTTTTTTTOKKKKKKKKKEN")
      console.log(token)

      if (!token) {
        return callback(false, 401, "Authentication token missing");
      }

      // Verify JWT token
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return callback(false, 401, "Invalid token");
        }

        // Attach user data to request for later use
        (info.req as any).userId = (decoded as any).userId;
        callback(true);
      });
    } catch (error) {
      console.error('Client verification error:', error);
      callback(false, 500, "Internal server error");
    }
  }

  private handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage): void {
    ws.userId = (req as any).userId;

    this.messagingService.connect(ws.userId, ws);

    ws.on("message", async (payload) => {
      try {
        const { event, data } = JSON.parse(payload.toString());

        switch (event) {
          case MessageType.BOOKING:
            await this.bookingManager.handleBookingEvent(ws, data);
            break;
          case MessageType.CHAT:
            // Handle chat events
            break;
          default:
            console.log(`Unknown event: ${event}`);
        }
      } catch (error) {
        console.error('Message handling error:', error);
      }
    });

    ws.on("error", this.handleError);
    ws.on("close", () => {
      this.messagingService.disconnect(ws.userId);
      this.handleDisconnection();
    });
  }

  private handleDisconnection(): void {
    console.log("Client disconnected");
  }

  private handleError(error: Error): void {
    console.error("WebSocket error:", error);
  }

  public start(): void {
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) =>
      this.handleConnection(ws as AuthenticatedWebSocket, req)
    );

    this.server.listen(SERVER_PORT, () => {
      console.log(`Server listening on port ${SERVER_PORT}`);
    });

    process.on("SIGINT", () => this.gracefulShutdown());
    process.on("SIGTERM", () => this.gracefulShutdown());
  }

  private gracefulShutdown(): void {
    console.log("Shutting down server...");

    this.wss.clients.forEach((client: WebSocket) => {
      const authClient = client as AuthenticatedWebSocket;
      if (authClient.userId) {
        this.messagingService.disconnect(authClient.userId);
      }
    });

    this.wss.close(() => {
      console.log("WebSocket server closed");
      this.server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  }
}

// Start the server
const server = new RealTimeServer();
server.start();
