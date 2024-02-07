// frontend\lib\hooks\useSupabaseSubscriptions.ts
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Message } from "../validators/message";
import { nanoid } from "nanoid";

// const SUPABASE_URL = process.env.SUPABASE_URL || "";
// const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || "";
const SUPABASE_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MDY5MTg0MDAsCiAgImV4cCI6IDE4NjQ3NzEyMDAKfQ.I6ZIUDFnXtjzNjkLPj_1B8BThU9ZdrNaZhXpG-5_KeA";
const SUPABASE_URL = "http://localhost:8000";
const supabase = createClient(SUPABASE_URL, SUPABASE_ACCESS_TOKEN);

export function useChatSubscription(channelName = "transcriptions_table") {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: channelName },
        (payload) => {
          console.log("[useChatSubscription] Change received!", payload);
          const newMessage: Message = {
            id: payload.new.id,
            isUserMessage: true,
            content: payload.new.content,
            create_at: payload.new.create_at,
            data_sent_timestamp: payload.new.data_sent_timestamp,
            speech_end_timestamp: payload.new.speech_end_timestamp,
            speech_length: payload.new.speech_length,
            transcription_end_timestamp:
              payload.new.transcription_end_timestamp,
            transcription_id: payload.new.transcription_id,
            transcription_time: payload.new.transcription_timestamp,
            user_id: payload.new.user_id,
          };
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  console.log("[useChatSubscription] messages", messages);

  return messages;
}
