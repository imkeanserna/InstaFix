import { S3Client } from '@aws-sdk/client-s3';

interface R2Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

class R2ClientManager {
  private static instance: S3Client | null = null;
  private static config: R2Config | null = null;

  private static getConfig(): R2Config {
    if (!process.env.R2_ENDPOINT ||
      !process.env.R2_ACCESS_KEY_ID ||
      !process.env.R2_SECRET_ACCESS_KEY ||
      !process.env.R2_PUBLIC_URL) {
      throw new Error('R2 configuration missing. Please check your environment variables.');
    }

    return {
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      publicUrl: process.env.R2_PUBLIC_URL,
    };
  }

  public static getClient(): S3Client {
    if (!this.instance) {
      this.config = this.getConfig();

      this.instance = new S3Client({
        region: 'auto',
        endpoint: this.config.endpoint,
        credentials: {
          accessKeyId: this.config.accessKeyId,
          secretAccessKey: this.config.secretAccessKey,
        },
      });
    }

    return this.instance;
  }

  public static getPublicUrl(): string {
    if (!this.config) {
      this.config = this.getConfig();
    }
    return this.config.publicUrl;
  }

  // Method to explicitly close the client if needed
  public static closeClient(): void {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }
}

export const getR2Client = () => R2ClientManager.getClient();
export const getR2PublicUrl = () => R2ClientManager.getPublicUrl();
export const closeR2Client = () => R2ClientManager.closeClient();
