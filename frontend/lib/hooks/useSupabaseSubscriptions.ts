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
  const { messages, addMessage } = useContext(MessagesContext);

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

          // Check if the message_id already exists in the context
        const isExistingMessage = messages.some(message => message.message_id === newMessage.message_id);

        if (!isExistingMessage) {
          console.log(`[useChatSubscription] ${getFormattedTimestamp()} - Received message: ${JSON.stringify(newMessage)}`);
        
          switch (newMessage.messageType) {
            case "user":
              // This message is from a user, trigger the generation of chatBotResponse
              onNewMessage(newMessage);
              break;
            case "chatBotResponse":
              // This message is a response from the chatBot, add it directly without triggering further actions
              console.log(`[useChatSubscription] ${getFormattedTimestamp()} - Received chatBot message: ${JSON.stringify(newMessage)}`);
              addMessage(newMessage);
              break;
            default:
              // Handle any other types of messages or log an unexpected message type
              console.warn(`[useChatSubscription] ${getFormattedTimestamp()} - Received message with unexpected type: ${newMessage.messageType}`);
              break;
          }
        } else {
          console.log(`[useChatSubscription] ${getFormattedTimestamp()} - Duplicate message ignored: ${newMessage.message_id}`);
        }
              })
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
