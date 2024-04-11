// frontend\components\chat\ChatMessages.tsx

/**
 * ChatMessages Component
 *
 * This component is responsible for rendering the chat messages in a conversation view.
 * It retrieves the messages from the MessagesContext and displays them in reverse order,
 * with the most recent message at the bottom.
 *
 * The component uses the `cn` utility function to conditionally apply CSS classes based on
 * certain conditions, such as whether a message is from the user or the AI.
 *
 * The messages are styled using Tailwind CSS classes to achieve a visually appealing and
 * responsive layout. The component also utilizes the `MarkdownLite` component to render
 * the message content with basic Markdown formatting.
 */

"use client";

import { MessagesContext } from "@/context/messages";
import { cn } from "@/lib/utils";
import { FC, HTMLAttributes, useContext } from "react";
import MarkdownLite from "./MarkdownLite";

interface ChatMessagesProps extends HTMLAttributes<HTMLDivElement> {}

const ChatMessages: FC<ChatMessagesProps> = ({ className, ...props }) => {
  // Retrieve the messages from the MessagesContext
  const { messages } = useContext(MessagesContext);

  // Create a new array with the messages in reverse order
  const inverseMessages = [...messages].reverse();

  return (
    <div
      {...props}
      // Apply conditional CSS classes using the `cn` utility function
      className={cn(
        "flex flex-col-reverse gap-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch",
        className
      )}
    >
      {/* Add an empty div to push the messages to the bottom */}
      <div className="flex-1 flex-grow" />

      {/* Map over the inverseMessages array and render each message */}
      {inverseMessages.map((message) => {
        return (
          <div
            className="chat-message"
            key={`${message.message_id}-${message.message_id}`}
          >
            <div
              // Conditionally apply 'justify-end' class if the message is from the user
              className={cn("flex items-end", {
                "justify-end": message.isUserMessage,
              })}
            >
              <div
                // Conditionally apply 'order-1' and 'order-2' classes based on message sender
                className={cn(
                  "flex flex-col space-y-2 text-sm max-w-xs mx-2 overflow-x-hidden",
                  {
                    "order-1 items-end": message.isUserMessage,
                    "order-2 items-start": !message.isUserMessage,
                  }
                )}
              >
                <p
                  // Conditionally apply background and text color classes based on message sender
                  className={cn("px-4 py-2 rounded-lg", {
                    "bg-blue-600 text-white": message.isUserMessage,
                    "bg-gray-200 text-gray-900": !message.isUserMessage,
                  })}
                >
                  {/* Render the message content using the MarkdownLite component */}
                  <MarkdownLite text={message.content} />
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
