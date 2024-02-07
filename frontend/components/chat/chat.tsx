// frontend\components\chat\chat.tsx
"use client";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/chat-list";
// import { FC, HTMLAttributes, useEffect, useState } from "react";
import { Message } from "@/lib/validators/message";
import { useChatSubscription } from "@/lib/hooks/useSupabaseSubscriptions";
import { useMutation } from "@tanstack/react-query";
// import { EmptyScreen } from "@/components/empty-screen";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}
export function Chat({ id, className }: ChatProps) {
  const {} = useMutation({})
  const messages = useChatSubscription("transcriptions_table");
  // console.log("[Chat] ID: ", id)

  return (
    <>
      <div
        className={cn(
          "border-2 border-blue-400 pb-[200px] pt-4 md:pt-10",
          className
        )}
      >
        <ChatList messages={messages} />
      </div>
    </>
  );
}