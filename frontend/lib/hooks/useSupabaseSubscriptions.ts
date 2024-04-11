// frontend\lib\hooks\useSupabaseSubscriptions.ts
"use client";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { useContext, useEffect } from "react";
import { Message } from "../validators/message";
import { MessagesContext } from "@/context/messages";
import { getFormattedTimestamp } from "../utils";

/**
 * This code sets up a Supabase client for real-time subscriptions and provides a custom hook
 * for subscribing to new messages in a chat application.
 *
 * The Supabase client is initialized using the provided URL and access token from environment variables.
 * If the required variables are missing or the initialization fails, appropriate error messages are logged
 * and exceptions are thrown.
 *
 * The `useChatSubscription` hook allows components to subscribe to new messages in the "transcriptions_table"
 * channel. When a new message is inserted into the table, the hook receives the message payload and processes
 * it based on the message type (user message or chatbot response).
 *
 * The `handleNewMessage` function is responsible for processing the received message. It checks for duplicate
 * or invalid messages and updates the application state accordingly. Initial messages are replaced, and new
 * messages are added or passed to the provided callback function based on their type.
 *
 * The code also includes logging statements to provide visibility into the message handling process and to
 * help with debugging and monitoring.
 */

// Get the Supabase URL and access token from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ACCESS_TOKEN =
  process.env.NEXT_PUBLIC_SUPABASE_ACCESS_TOKEN || "";

// Check if the required environment variables are set
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

// Initialize the Supabase client
let supabase: SupabaseClient<any, "public", any> | null = null;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_ACCESS_TOKEN);
  console.log("Supabase client has been successfully initialized.");
} catch (error) {
  console.log(`Failed to initialize Supabase client: ${error}`);
  throw new Error(`Supabase client initialization failed: ${error}`);
}

/**
 * Custom hook for subscribing to new messages in the chat application.
 *
 * @param onNewMessage Callback function to be invoked when a new user message is received.
 */
export function useChatSubscription(onNewMessage: (message: Message) => void) {
  const { messages, addMessage, removeMessage } = useContext(MessagesContext);

  useEffect(() => {
    if (!supabase) {
      console.error("Supabase client is not initialized.");
      return;
    }

    // Subscribe to the "transcriptions_table" channel for new message inserts
    const channelName = "transcriptions_table";
    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: channelName },
        (payload) => {
          // Create a new message object from the received payload
          const newMessage: Message = {
            message_id: payload.new.transcription_id,
            isUserMessage: true,
            content: `Question: ${payload.new.content}?`,
            speech_end_timestamp: payload.new.speech_end_timestamp,
            transcription_time: payload.new.transcription_time,
            messageType: payload.new.messageType,
          };

          // Handle the new message based on its type and application state
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

    // Unsubscribe from the channel when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [addMessage, messages, onNewMessage, removeMessage]);
}

/**
 * Interface defining the properties for the `handleNewMessage` function.
 */
interface HandleNewMessageProps {
  newMessage: Message;
  messages: Message[];
  addMessage: (message: Message) => void;
  removeMessage: (message_id: string) => void;
  onNewMessage: (message: Message) => void;
}

/**
 * Handles the processing of new messages received from the Supabase subscription.
 *
 * @param props Object containing the new message, current messages, and message management functions.
 */
const handleNewMessage = ({
  newMessage,
  messages,
  addMessage,
  removeMessage,
  onNewMessage,
}: HandleNewMessageProps) => {
  // Check if the current message is the initial message
  const isInitialMessage =
    messages.length === 1 &&
    messages[0].content === "Are you ready to get started?";

  // Check if the new message already exists in the current messages
  const isExistingMessage = messages.some(
    (message) => message.message_id === newMessage.message_id
  );

  // Ignore the message if it has no ID or already exists
  if (!newMessage.message_id || isExistingMessage) {
    console.warn(
      `[handleNewMessage] ${getFormattedTimestamp()} - Ignored message: `,
      newMessage
    );
    return;
  }

  // Replace the initial message with the new user message
  if (isInitialMessage && newMessage.isUserMessage) {
    console.log(
      `[handleNewMessage] ${getFormattedTimestamp()} - Replacing initial message with: `,
      newMessage
    );
    removeMessage(messages[0].message_id);
  }

  // Process the new message based on its type
  switch (newMessage.messageType) {
    case "user":
      console.log(
        `[handleNewMessage] ${getFormattedTimestamp()} - User message received: `,
        newMessage
      );
      onNewMessage(newMessage);
      break;
    case "chatBotResponse":
      console.log(
        `[handleNewMessage] ${getFormattedTimestamp()} - ChatBot response received: `,
        newMessage
      );
      addMessage(newMessage);
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
