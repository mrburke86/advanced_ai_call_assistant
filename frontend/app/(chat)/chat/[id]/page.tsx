// frontend\app\(chat)\chat\[id]\page.tsx
/**
 * This file represents the page component for an individual chat, located at the route:
 * frontend\app\(chat)\chat\[id]\page.tsx
 *
 * It imports necessary dependencies, defines the props interface, and exports two main functions:
 * 1. generateMetadata: An async function that generates the metadata for the chat page.
 * 2. ChatPage: The default export which represents the chat page component.
 */

import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getChat } from "@/app/actions";
import { Chat } from "@/components/chat/chat";

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const chat = await getChat(params.id, "local-user");
  return {
    title: chat?.title.toString().slice(0, 50) ?? "Chat",
  };
}

/**
 * ChatPage is the default export and represents the main chat page component.
 * @param {ChatPageProps} props - The props object containing the chat ID parameter.
 * @returns {JSX.Element} - The rendered chat page component.
 */
export default async function ChatPage({ params }: ChatPageProps) {
  // Retrieve the chat data using the getChat function and the provided chat ID and user ID
  const chat = await getChat(params.id, "local-user");

  // If the chat data is not found, render the not found page
  if (!chat) {
    notFound();
  }

  // Render the Chat component with the chat ID and initial messages
  return <Chat id={chat.id} initialMessages={chat.messages} />;
}
