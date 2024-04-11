// frontend\components\chat\chat.tsx

/**
 * This is the main Chat component that renders the chat interface.
 * It includes the ChatList component and sets up the necessary styling.
 *
 * The component is marked as a client-side component using the "use client" directive.
 *
 * @module Chat
 */

"use client";

import { ChatList } from "@/components/chat/chat-list";
import { Message } from "@/lib/validators/message";
import { cn } from "@/lib/utils";

/**
 * Interface defining the props for the Chat component.
 *
 * @interface ChatProps
 * @extends React.ComponentProps<"div">
 * @property {string} [chat_id] - The ID of the chat.
 * @property {Message[]} [initialMessages] - The initial messages to display in the chat.
 */

export interface ChatProps extends React.ComponentProps<"div"> {
  chat_id?: string;
  initialMessages?: Message[];
}

/**
 * The main Chat component.
 *
 * @component
 * @param {ChatProps} props - The props for the Chat component.
 * @param {string} [props.chat_id] - The ID of the chat.
 * @param {string} props.className - Additional class names to apply to the component.
 * @returns {JSX.Element} The rendered Chat component.
 */
export function Chat({ chat_id, className }: ChatProps) {
  return (
    <>
      <div
        className={cn(
          "border-2 border-blue-400 pb-[200px] pt-4 md:pt-10",
          className
        )}
      >
        {/* Render the ChatList component */}
        <ChatList />
      </div>
    </>
  );
}
