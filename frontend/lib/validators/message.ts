// frontend\lib\validators\message.ts
import { z } from "zod";

export const MessageSchema = z.object({
    message_id: z.string(),
    messageType: z.string(),
    isUserMessage: z.boolean(),
    content: z.string(),
    speech_end_timestamp: z.string(),
    transcription_time: z.number(),
    // transcription_id: z.string(),
    // data_sent_timestamp: z.string().optional(),
    // create_at: z.string(),
    // speech_length: z.number().optional(),
    // transcription_end_timestamp: z.string().optional(),
    // user_id: z.string(),
});

// Array Validator
export const MessageArraySchema = z.array(MessageSchema);

export type Message = z.infer<typeof MessageSchema>;
