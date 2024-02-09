// frontend\lib\hooks\useSupabaseSubscriptions.ts
"use client";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { useContext, useEffect } from "react";
import { Message } from "../validators/message";
import { MessagesContext } from "@/context/messages";
import { getFormattedTimestamp } from "../utils";

// Environment variable validation
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN || "";

if (!SUPABASE_URL) {
  console.log(
    "Supabase URL is missing. Please check your environment variables."
  );
  throw new Error("Supabase URL is missing.");
}

if (!SUPABASE_ACCESS_TOKEN) {
  console.log(
    "Supabase Access Token is missing. Please check your environment variables."
  );
  throw new Error("Supabase Access Token is missing.");
}

let supabase: SupabaseClient<any, "public", any> | null = null;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ACCESS_TOKEN);
  console.log("Supabase client has been successfully initialized.");
} catch (error) {
  // Handle potential errors from Supabase client initialization
  console.log(`Failed to initialize Supabase client: ${error}`);
  throw new Error(`Supabase client initialization failed: ${error}`);
}

export function useChatSubscription(onNewMessage: (message: Message) => void) {
  const { messages, addMessage, removeMessage } = useContext(MessagesContext);

  useEffect(() => {
    // Check if supabase is null before proceeding
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return;
    }

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
            content: `Question: ${payload.new.content}?`,
            speech_end_timestamp: payload.new.speech_end_timestamp,
            transcription_time: payload.new.transcription_time,
            messageType: payload.new.messageType,
          };

          // Check if the message_id already exists in the context
          handleNewMessage({
            newMessage,
            messages,
            addMessage,
            removeMessage,
            onNewMessage,
          });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [addMessage, messages, onNewMessage, removeMessage]); // Include onNewMessage in the dependencies array
}

interface HandleNewMessageProps {
  newMessage: Message;
  messages: Message[];
  addMessage: (message: Message) => void;
  removeMessage: (message_id: string) => void;
  onNewMessage: (message: Message) => void;
}

const handleNewMessage = ({
  newMessage,
  messages,
  addMessage,
  removeMessage,
  onNewMessage,
}: HandleNewMessageProps) => {
  const isInitialMessage =
    messages.length === 1 &&
    messages[0].content === "Are you ready to get started?";

  const isExistingMessage = messages.some(
    (message) => message.message_id === newMessage.message_id
  );

  if (!newMessage.message_id || isExistingMessage) {
    console.warn(
      `[handleNewMessage] ${getFormattedTimestamp()} - Ignored message: `,
      newMessage
    );
    return; // Exit if message is a duplicate or lacks an ID
  }

  if (isInitialMessage && newMessage.isUserMessage) {
    console.log(
      `[handleNewMessage] ${getFormattedTimestamp()} - Replacing initial message with: `,
      newMessage
    );
    removeMessage(messages[0].message_id); // Remove initial message
  }

  switch (newMessage.messageType) {
    case "user":
      console.log(
        `[handleNewMessage] ${getFormattedTimestamp()} - User message received: `,
        newMessage
      );
      onNewMessage(newMessage); // Trigger logic for new user messages
      break;
    case "chatBotResponse":
      console.log(
        `[handleNewMessage] ${getFormattedTimestamp()} - ChatBot response received: `,
        newMessage
      );
      addMessage(newMessage); // Directly add ChatBot responses
      break;
    default:
      console.warn(
        `[handleNewMessage] ${getFormattedTimestamp()} - Unexpected messageType: ${
          newMessage.messageType
        }`
      );
      break;
  }
};
// } else if (!newMessage.message_id) {
//   console.warn(
//     `[useChatSubscription] ${getFormattedTimestamp()} - Ignored message without a valid message_id: ${JSON.stringify(
//       newMessage
//     )}`
//   );
// } else {
//   console.log(
//     `[useChatSubscription] ${getFormattedTimestamp()} - Duplicate message ignored: ${
//       newMessage.message_id
//     }`
//   );
// }
