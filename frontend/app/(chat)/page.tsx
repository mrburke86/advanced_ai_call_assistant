// frontend\app\(chat)\page.tsx
import { nanoid } from "@/lib/utils";
import { Chat } from "@/components/chat/chat";

export default function IndexPage() {
  const chat_id = nanoid();

  return <Chat chat_id={chat_id} />;
}
