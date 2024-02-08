// frontend\lib\hooks\useSupabaseSubscriptions.ts
"use client";
import { createClient } from "@supabase/supabase-js";
import { useContext, useEffect } from "react";
import { Message } from "../validators/message";
import { MessagesContext } from "@/context/messages";

const SUPABASE_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ACCESS_TOKEN);

export function useChatSubscription(onNewMessage: (message: Message) => void) {
  const { addMessage } = useContext(MessagesContext);

  useEffect(() => {
    const channelName = "transcriptions_table";
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: channelName },
        (payload) => {
          const newMessage: Message = {
            message_id: payload.new.transcription_id,
            isUserMessage: true,
            content: payload.new.content,
            speech_end_timestamp: payload.new.speech_end_timestamp,
            transcription_time: payload.new.transcription_time,
            messageType: payload.new.messageType,
          };
          console.log(
            `[useChatSubscription] ${getFormattedTimestamp()} - New message received:`,
            newMessage
          );
          addMessage(newMessage);
          console.log(
            `[useChatSubscription] ${getFormattedTimestamp()} - New message added to context:`,
            newMessage
          );

          // Only trigger the callback if the message is from the user (or adjust based on your criteria)
          if (newMessage.messageType === "user") {
            console.log(
              `[useChatSubscription] ${getFormattedTimestamp()} - Received user message: ${JSON.stringify(
                newMessage
              )}`
            );
            onNewMessage(newMessage);
          } else {
            console.log(
              `[useChatSubscription] ${getFormattedTimestamp()} - Received bot message: ${JSON.stringify(
                newMessage
              )}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [addMessage, onNewMessage]); // Include onNewMessage in the dependencies array
}

function getFormattedTimestamp(): string {
  const now = new Date();
  const timeWithMilliseconds =
    now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) +
    "." +
    String(now.getMilliseconds()).padStart(3, "0");
  const date = now.toLocaleDateString("en-US");
  return `${date}, ${timeWithMilliseconds}`;
}
