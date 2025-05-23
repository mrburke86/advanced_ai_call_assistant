// frontend\components\chat\chat-history.tsx

/**
 * This module contains the ChatHistory component, which displays a list of chat conversations
 * and a button to start a new chat. It uses the SidebarList component to render the chat history.
 */

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarList } from "@/components/sidebar/sidebar-list";
import { buttonVariants } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";

interface ChatHistoryProps {
  userId?: string;
}

/**
 * ChatHistory component displays a list of chat conversations and a button to start a new chat.
 * @param {ChatHistoryProps} props - The props object containing the userId.
 * @returns {JSX.Element} - The rendered ChatHistory component.
 */
export async function ChatHistory({ userId }: ChatHistoryProps) {
  return (
    <div className="flex flex-col h-full">
      {/* New Chat button */}
      <div className="px-2 my-4">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 w-full justify-start bg-zinc-50 px-4 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10"
          )}
        >
          <IconPlus className="-translate-x-2 stroke-2" />
          New Chat
        </Link>
      </div>

      {/* Chat history list */}
      <React.Suspense
        fallback={
          // Fallback loading state
          <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        }
      >
        {/* Render the SidebarList component */}
        {/* @ts-ignore */}
        <SidebarList userId={userId} />
      </React.Suspense>
    </div>
  );
}
