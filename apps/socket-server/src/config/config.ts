import dotenv from "dotenv";

dotenv.config();

export const REDIS_URL = process.env.REDIS_URL as string;
export const DATABASE_URL = process.env.DATABASE_URL as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const SERVER_PORT = process.env.PORT || 3001;
export const FRONTEND_URL = process.env.FRONTEND_URL as string;
export const SYSTEM_EMAIL = process.env.SYSTEM_EMAIL as string;
export const SYSTEM_PASSWORD = process.env.SYSTEM_PASSWORD as string;
