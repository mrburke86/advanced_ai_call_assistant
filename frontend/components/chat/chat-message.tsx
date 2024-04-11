// frontend\components\chat\chat-message.tsx

/**
 * ChatMessage Component
 *
 * This component represents an individual chat message in the chat interface.
 * It displays the message content, along with an icon indicating whether the
 * message was sent by the user or the AI assistant (OpenAI).
 *
 * The component uses the following dependencies:
 * - React: The React library for building the component.
 * - remarkGfm: A remark plugin for parsing GitHub Flavored Markdown (GFM).
 * - remarkMath: A remark plugin for parsing mathematical expressions.
 * - cn: A utility function for conditionally joining CSS class names.
 * - CodeBlock: A component for rendering code blocks with syntax highlighting.
 * - MemoizedReactMarkdown: A memoized version of the ReactMarkdown component for efficient rendering of Markdown content.
 * - IconOpenAI: An icon component representing the OpenAI assistant.
 * - IconUser: An icon component representing the user.
 * - Message: An interface defining the structure of a chat message.
 * - MarkdownLite: A lightweight component for rendering Markdown content (currently commented out).
 */
import React, { FC } from "react";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/codeblock";
import { MemoizedReactMarkdown } from "@/components/chat/markdown";
import { IconOpenAI, IconUser } from "@/components/ui/icons";
import { Message } from "@/lib/validators/message";
import MarkdownLite from "./MarkdownLite";

export interface ChatMessageProps {
  message: Message;
}

/**
 * ChatMessage Component
 *
 * Renders an individual chat message with the appropriate styling and icons based on whether
 * the message was sent by the user or the AI assistant.
 *
 * @param {ChatMessageProps} props - The props object containing the message to be rendered.
 * @returns {JSX.Element} The rendered chat message component.
 */
export function ChatMessage({ message, ...props }: ChatMessageProps) {
  // Determine if the message was sent by the user
  const isUserMessage = message.isUserMessage;

  return (
    // Chat Message Container
    <div
      // Apply conditional CSS classes based on whether the message is from the user or the AI
      className={cn(
        "group relative mb-4 flex items-start rounded-md px-2 py-2 border bg-zinc-700 text-white",
        isUserMessage ? "ml-auto md:-ml-10 bg-blue-600" : "mr-auto md:-mr-10"
      )}
      {...props}
    >
      {/* Message Icon */}
      <div
        // Apply conditional CSS classes based on whether the message is from the user or the AI
        className={cn(
          "flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
          isUserMessage ? "bg-background" : "bg-primary text-primary-foreground"
        )}
      >
        {/* Display the appropriate icon based on the message sender */}
        {isUserMessage ? <IconUser /> : <IconOpenAI />}
      </div>

      {/* Message Content */}
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        {/* Render the message content using MemoizedReactMarkdown */}
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            // Custom rendering for paragraph elements
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>;
            },
            // Custom rendering for code blocks
            code({ node, className, children, ...props }) {
              const childArray = React.Children.toArray(children);
              const firstChild = childArray[0] as React.ReactElement;
              const firstChildAsString = React.isValidElement(firstChild)
                ? (firstChild as React.ReactElement).props.children
                : firstChild;

              // Handle special case for cursor symbol
              if (firstChildAsString === "▍") {
                return (
                  <span className="mt-1 animate-pulse cursor-default">▍</span>
                );
              }

              // Replace cursor symbol in code block
              if (typeof firstChildAsString === "string") {
                childArray[0] = firstChildAsString.replace("`▍`", "▍");
              }

              // Extract the language from the className
              const match = /language-(\w+)/.exec(className || "");

              // Render inline code if the code block is a single line
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

              // Render a CodeBlock component for multi-line code blocks
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

        {/* Display the transcription time */}
        <div className={cn("text-xs text-gray-400")}>
          Transcription Time: {message.transcription_time.toFixed(2)} secs
        </div>
        {/* Placeholder for chat message actions (currently commented out) */}
        {/* <ChatMessageActions message={message} /> */}
      </div>
    </div>
  );
}
