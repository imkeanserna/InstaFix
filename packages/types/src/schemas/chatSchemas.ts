import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().or(z.string().cuid()),
  body: z.string().min(1).optional(),
  files: z.array(z.string()).optional()
}).refine(data => {
  return (data.files && data.files.length > 0) ? true : data.body !== undefined;
}, {
  message: "Either body, image, or files must be provided"
});

export const startConversationSchema = z.object({
  recipientId: z.string().uuid().or(z.string().cuid()),
});

export const readStatusSchema = z.object({
  conversationId: z.string().uuid().or(z.string().cuid()),
});

export const typingStatusSchema = z.object({
  conversationId: z.string().uuid().or(z.string().cuid()),
  status: z.enum(["TYPING", "STOPPED_TYPING"])
});

export const deleteMessageSchema = z.object({
  messageId: z.string().uuid().or(z.string().cuid()),
  conversationId: z.string().uuid().or(z.string().cuid()),
});
