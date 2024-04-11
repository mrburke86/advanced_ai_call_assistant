// frontend\components\chat\chat-list.tsx

import { ChatMessage } from "@/components/chat/chat-message";
import { MessagesContext } from "@/context/messages";
import { useChatSubscription } from "@/lib/hooks/useSupabaseSubscriptions";
import { cn, getFormattedTimestamp, nanoid } from "@/lib/utils";
import { Message } from "@/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { FC, HTMLAttributes, JSX, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Readable } from "stream";
import { Separator } from "../ui/separator";

/**
 * ChatList Component
 *
 * This component is responsible for rendering a list of chat messages and handling the sending and receiving of messages.
 * It utilizes the MessagesContext to manage the state of messages and the useMutation hook from react-query to send messages to the backend API.
 *
 * The component subscribes to real-time updates from the backend using the useChatSubscription hook.
 *
 * When a user sends a message, the component optimistically adds the message to the messages state and sends a request to the backend API.
 * Upon receiving a response from the backend, the component updates the messages state with the response message and its content.
 *
 * If an error occurs during the message sending process, an error toast is displayed, and the message is removed from the messages state.
 */

interface ChatListProps extends HTMLAttributes<HTMLDivElement> {}

export const ChatList: FC<ChatListProps> = ({ className, ...props }) => {
  const { toast } = useToast();

  // Get the messages and related functions from the MessagesContext
  const {
    messages,
    addMessage,
    removeMessage,
    updateMessage,
    setIsMessageUpdating,
  } = useContext(MessagesContext);

  // Define the mutation for sending messages using React Query
  const { mutate: sendMessageMutation, isPending } = useMutation({
    // Mutation function that sends the message to the backend API
    mutationFn: async (_message: Message) => {
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - Mutation function called with message:`,
        _message
      );
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }), // Ensure this matches your backend expectation
      });
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - Fetch response received`
      );
      return response.body;
    },

    // The onMutate function is called before the mutation is fired and adds the message to the local state
    onMutate(message) {
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onMutate - message being added:`,
        message
      );
      // Optimistically add the message to the messages state
      addMessage(message);
    },

    // The onSuccess function is called when the mutation is successful and processes the server's response
    onSuccess: async (stream) => {
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onSuccess - stream received:`,
        stream
      );
      if (!stream) throw new Error("No stream!");

      // Generate a unique ID for the response message
      const message_id = nanoid();

      // Create a new response message object
      const responseMessage: Message = {
        message_id,
        isUserMessage: false,
        content: "",
        speech_end_timestamp: "",
        transcription_time: 0,
        messageType: "chatBotResponse",
      };
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onSuccess - generated message ID:`,
        message_id
      );
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - Message ID: ${message_id} | Response Message:`,
        responseMessage
      );

      // Add the response message to the messages state
      addMessage(responseMessage);

      // Set the message updating state to true
      setIsMessageUpdating(true);

      // Read the response stream and update the message content
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          // Check if value is not undefined
          const chunkValue = decoder.decode(value);
          console.log(
            `[ChatList] ${getFormattedTimestamp()} - onSuccess - Received chunk: ${chunkValue}`
          );
          // Update the message content with the received chunk
          updateMessage(message_id, (prev) => prev + chunkValue);
        }
      }

      // Set the message updating state to false
      setIsMessageUpdating(false);
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onSuccess - Stream processing complete`
      );
    },

    // Function called when an error occurs during the mutation
    onError: (_, message) => {
      console.error(
        `[ChatList] ${getFormattedTimestamp()} - onError - Error occurred`,
        message
      );
      // Display an error toast
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      // Remove the message from the messages state
      removeMessage(message.message_id);
    },
  });

  // Subscribe to real-time updates using the useChatSubscription hook
  useChatSubscription(sendMessageMutation);

  // Reverse the order of messages for rendering
  const inverseMessages = [...messages].reverse();

  return (
    <div {...props} className="relative mx-auto max-w-2xl px-4">
      {/* Render the chat messages */}
      {messages.map((message, index) => (
        <div key={`${message.message_id}-${message.message_id}`}>
          <ChatMessage message={message} />
          {/* Add a separator between messages except for the last message */}
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  );
};
