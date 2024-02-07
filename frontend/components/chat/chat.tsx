// frontend\components\chat\chat.tsx
"use client";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/chat-list";
// import { FC, HTMLAttributes, useEffect, useState } from "react";
import { Message } from "@/lib/validators/message";
import { useChatSubscription } from "@/lib/hooks/useSupabaseSubscriptions";
// import { EmptyScreen } from "@/components/empty-screen";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}
export function Chat({ id, initialMessages, className }: ChatProps) {
  const messages = useChatSubscription("transcriptions_table");
  LatestMessageLogging(messages);

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

function LatestMessageLogging(
  messages: {
    id: string;
    isUserMessage: boolean;
    content: string;
    create_at: string;
    data_sent_timestamp: string;
    speech_end_timestamp: string;
    speech_length: number;
    transcription_end_timestamp: string;
    transcription_id: string;
    transcription_time: string;
    user_id: string;
  }[]
) {
  console.log(`[Chat] Current Time: ${new Date().toISOString()}`);
  console.log(
    `[Chat] Message ID: ${messages.slice(0, 1).map((msg) => msg.id)}`
  );
  console.log(
    `[Chat] Message: ${messages.slice(0, 1).map((msg) => msg.content)}`
  );
  console.log(
    `[Chat] Transcription End Time: ${messages
      .slice(0, 1)
      .map((msg) => msg.transcription_end_timestamp)}`
  );
  console.log(
    `[Chat] Speech End Time: ${messages
      .slice(0, 1)
      .map((msg) => msg.speech_end_timestamp)}`
  );
}
