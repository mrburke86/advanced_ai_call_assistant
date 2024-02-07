// frontend\components\chat\chat-list.tsx

// import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat/chat-message";
import { MessagesContext } from "@/context/messages";
import { FC, HTMLAttributes, JSX, useContext } from "react";
// import { cn } from "@/lib/utils";
// import { FC, HTMLAttributes, useContext } from "react";

interface ChatListProps extends HTMLAttributes<HTMLDivElement> {}


export const ChatList: FC<ChatListProps> = ({ className, ...props }) => {
  const { messages } = useContext(MessagesContext)
  const inverseMessages = [...messages].reverse()
  console.log("[ChatList] Messages: ", messages);

  return (
    <div {...props} className="relative mx-auto max-w-2xl px-4 border-2 border-red-400">
      {inverseMessages.map((message) => (
        <div key={`${message.id}-${message.id}`}>
          <ChatMessage message={message} />
        </div>
      ))}
    </div>
  );
}