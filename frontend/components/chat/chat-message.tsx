// frontend\components\chat\chat-message.tsx
// Inspired by Chatbot-UI and modified to fit the needs of this project
// @see https://github.com/mckaywrigley/chatbot-ui/blob/main/components/Chat/ChatMessage.tsx

import React, { FC } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/codeblock";
import { MemoizedReactMarkdown } from "@/components/chat/markdown";
import { IconOpenAI, IconUser } from "@/components/ui/icons";
// import { ChatMessageActions } from "@/components/chat/chat-message-actions";
import { Message } from "@/lib/validators/message";
import MarkdownLite from "./MarkdownLite";

export interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message, ...props }: ChatMessageProps) {
  const isUserMessage = message.isUserMessage;

  return (
    // Chat Message Container
    <div
      className={cn(
        "group relative mb-4 flex items-start rounded-md px-2 py-2 border bg-zinc-700 text-white",
        isUserMessage ? "ml-auto md:-ml-10 bg-blue-600" : "mr-auto md:-mr-10"
      )}
      {...props}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
          isUserMessage ? "bg-background" : "bg-primary text-primary-foreground"
        )}
      >
        {isUserMessage ? <IconUser /> : <IconOpenAI />}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            code({ node, className, children, ...props }) {
              const childArray = React.Children.toArray(children);
              const firstChild = childArray[0] as React.ReactElement;
              const firstChildAsString = React.isValidElement(firstChild)
                ? (firstChild as React.ReactElement).props.children
                : firstChild;

              if (firstChildAsString === "▍") {
                return (
                  <span className="mt-1 animate-pulse cursor-default">▍</span>
                );
              }

              if (typeof firstChildAsString === "string") {
                childArray[0] = firstChildAsString.replace("`▍`", "▍");
              }

              const match = /language-(\w+)/.exec(className || "");

              if (
                typeof firstChildAsString === "string" &&
                !firstChildAsString.includes("\n")
              ) {
                return (
                  <code className={className} {...props}>
                    {childArray}
                  </code>
                );
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ""}
                  value={String(children).replace(/\n$/, "")}
                  {...props}
                />
              );
            },
          }}
        >
          {message.content}
        </MemoizedReactMarkdown>
        {/* <MarkdownLite text={message.content} /> */}
        <div className={cn("text-xs text-gray-400")}>
          Transcription Time: {message.transcription_time.toFixed(2)} secs
        </div>
        {/* <ChatMessageActions message={message} /> */}
      </div>
    </div>
  );
}
