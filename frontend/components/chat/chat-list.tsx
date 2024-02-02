// frontend\components\chat\chat-list.tsx
import { type Message } from "ai";

import { Separator } from "@/components/ui/separator";
import { ChatMessage } from "@/components/chat/chat-message";

export interface ChatList {
  messages: Message[];
}

export function ChatList() {
  return (
    <div className="relative mx-auto max-w-2xl px-4 border-2 border-red-400">
      {" "}
      Chat List
    </div>
  );
}

// import { type Message } from "ai";

// import { Separator } from "@/components/ui/separator";
// import { ChatMessage } from "@/components/chat/chat-message";

// export interface ChatList {
//   messages: Message[];
// }

// export function ChatList({ messages }: ChatList) {
//   if (!messages.length) {
//     return null;
//   }

//   return (
//     <div className="relative mx-auto max-w-2xl px-4">
//       {messages.map((message, index) => (
//         <div key={index}>
//           <ChatMessage message={message} />
//           {index < messages.length - 1 && (
//             <Separator className="my-4 md:my-8" />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }
