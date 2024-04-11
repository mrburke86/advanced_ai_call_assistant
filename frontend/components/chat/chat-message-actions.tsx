// frontend\components\chat\chat-message-actions.tsx
"use client";

import { type Message } from "ai";

import { Button } from "@/components/ui/button";
import { IconCheck, IconCopy } from "@/components/ui/icons";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface ChatMessageActionsProps extends React.ComponentProps<"div"> {
  message: Message;
}

/**
 * ChatMessageActions component.
 * Renders a set of actions for a chat message, including a copy to clipboard button.
 *
 * @param {ChatMessageActionsProps} props - The props for the component, including the message and any additional className or props.
 * @returns {JSX.Element} The rendered ChatMessageActions component.
 */
export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  // Use the useCopyToClipboard hook to handle copying the message content to the clipboard
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  /**
   * Handler for the copy button click event.
   * Copies the message content to the clipboard if it hasn't already been copied.
   */
  const onCopy = () => {
    if (isCopied) return;
    copyToClipboard(message.content);
  };

  return (
    <div
      className={cn(
        "flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0",
        className
      )}
      {...props}
    >
      {/* Render a copy button */}
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {/* Display a check icon if the content has been copied, otherwise display a copy icon */}
        {isCopied ? <IconCheck /> : <IconCopy />}
        {/* Add a screen reader only text for accessibility */}
        <span className="sr-only">Copy message</span>
      </Button>
    </div>
  );
}
