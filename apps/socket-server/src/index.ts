import { createServer, IncomingMessage } from "http";
import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;

class RealTimeServer {
  private server: ReturnType<typeof createServer>;
  private wss: WebSocketServer;

  constructor() {
    this.server = createServer();
    this.wss = new WebSocketServer({ server: this.server });
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const origin = req.headers.origin;

    const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:3000"];

    if (origin) {
      if (!allowedOrigins.includes(origin)) {
        console.log(`Connection rejected from origin: ${origin}`);
        ws.close();
        return;
      }
    }

    ws.on("message", async (payload) => {
      const { event, data } = JSON.parse(payload.toString())

      console.log(`Received event: ${event} with data: ${data}`);
    });

    ws.on("error", this.handleError);
    ws.on("close", () => {
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
    this.wss.on("connection", (ws: WebSocket, req: IncomingMessage) => this.handleConnection(ws, req));

    this.server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    process.on("SIGINT", () => this.gracefulShutdown());
    process.on("SIGTERM", () => this.gracefulShutdown());
  }

  private gracefulShutdown(): void {
    console.log("Shutting down server...");
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
