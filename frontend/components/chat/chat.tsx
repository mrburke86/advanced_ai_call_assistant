// frontend\components\chat\chat.tsx
"use client";

import { ChatList } from "@/components/chat/chat-list";
import { Message } from "@/lib/validators/message";
import { cn } from "@/lib/utils";
// import { useChatSubscription } from "@/lib/hooks/useSupabaseSubscriptions";
// import { useMutation } from "@tanstack/react-query";
// import { usePathname, useRouter } from "next/navigation";
// import { useContext, useEffect } from "react";
// import { MessagesContext } from "@/context/messages";

export interface ChatProps extends React.ComponentProps<"div"> {
  chat_id?: string;
  initialMessages?: Message[];
}
export function Chat({ chat_id, className }: ChatProps) {
  return (
    <>
      <div
        className={cn(
          "border-2 border-blue-400 pb-[200px] pt-4 md:pt-10",
          className
        )}
      >
        <ChatList />
      </div>
    </>
  );
}
