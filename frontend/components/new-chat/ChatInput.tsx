// frontend\components\new-chat\ChatInput.tsx
"use client";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/chat-list";
import { FC, HTMLAttributes, useEffect, useState } from "react";

export interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {}

const ChatInput: FC<ChatInputProps> = ({ className, ...props }) => {
  const [input, setInput] = useState<string>("");

  // useEffect(() => {
  //   const eventSource = new EventSource(`/api/receive-data`);

  //   eventSource.onmessage = (event) => {
  //     const newData = JSON.parse(event.data);
  //     setInput((prevMessages) => [...prevMessages, newData]);
  //   };

  //   return () => eventSource.close();
  // }, []);

  return (
    <>
      <div
        className={cn(
          "pt-4 md:py-10 relative mx-auto max-w-2xl px-4 border-2 border-red-400 mt-4",
          className
        )}
      >
        <TextareaAutosize
          rows={2}
          maxRows={4}
          value={input}
          autoFocus
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message..."
          className="peer disabled:opacity-50 pr-14 resize-none block w-full border-0 bg-zinc-100 py-1.5 text-gray-900 focus:ring-0 text-sm sm:leading-6"
        />
      </div>
    </>
  );
};

export default ChatInput;
