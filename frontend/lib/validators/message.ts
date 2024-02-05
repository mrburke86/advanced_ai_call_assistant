// frontend\lib\validators\message.ts
import { z } from "zod";

export const MessageSchema = z.object({
  id: z.string(),
  isUserMessage: z.boolean(),
  content: z.string(),
  create_at: z.string(),
  data_sent_timestamp: z.string(),
  speech_end_timestamp: z.string(),
  speech_length: z.number(),
  transcription_end_timestamp: z.string(),
  transcription_id: z.string(),
  transcription_time: z.string(),
  user_id: z.string(),
});

// Array Validator
export const MessageArraySchema = z.array(MessageSchema);
export type Message = z.infer<typeof MessageSchema>;
