// frontend\components\chat\chat.tsx
"use client";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/chat-list";
import { EmptyScreen } from "@/components/empty-screen";
import { FC, HTMLAttributes, useEffect, useState } from "react";
import { Message } from "ai";
import ChatInput from "../new-chat/ChatInput";

// export interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {}

const Chat: FC = () => {
  // const [input, setInput] = useState<Message>

  // useEffect(() => {
  //   const eventSource = new EventSource(`/api/receive-data`);

  //   eventSource.onmessage = (event) => {
  //     const newData = JSON.parse(event.data);
  //     setMessages((prevMessages) => [...prevMessages, newData]);
  //   };

  //   return () => eventSource.close();
  // }, []);

  // Optional: Function to handle setting input, if you have an input field
  // const setInput = (inputValue) => {
  //   // handle input change here
  // };

  return (
    <>
      <div className="border-2 border-blue-400 pb-[200px] pt-4 md:pt-10">
        <ChatList />
        <ChatInput />
      </div>
    </>
  );
};

export default Chat;

// "use client";

// import { useChat, type Message } from "ai/react";

// import { cn } from "@/lib/utils";
// import { ChatList } from "@/components/chat/chat-list";
// import { ChatPanel } from "@/components/chat/chat-panel";
// import { EmptyScreen } from "@/components/empty-screen";
// import { ChatScrollAnchor } from "@/components/chat/chat-scroll-anchor";
// import { toast } from "react-hot-toast";
// // import { usePathname } from "next/navigation";
// import { useLocalStorage } from "@/lib/hooks/use-local-storage";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { usePathname, useRouter } from "next/navigation";

// const IS_PREVIEW = process.env.VERCEL_ENV === "preview";
// export interface ChatProps extends React.ComponentProps<"div"> {
//   initialMessages?: Message[];
//   id?: string;
// }

// export function Chat({ id, initialMessages, className }: ChatProps) {
//   const path = usePathname();
//   const router = useRouter();
//   const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
//     "ai-token",
//     null
//   );
//   const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW);
//   const [previewTokenInput, setPreviewTokenInput] = useState(
//     previewToken ?? "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"
//   );
//   const { messages, append, reload, stop, isLoading, input, setInput } =
//     useChat({
//       initialMessages,
//       id,
//       body: {
//         id,
//         previewToken,
//       },
//       onResponse(response) {
//         if (response.status === 401) {
//           toast.error(response.statusText);
//         }
//       },
//       onFinish() {
//         if (!path.includes("chat")) {
//           window.history.pushState({}, "", `/chat/${id}`);
//         }
//       },
//     });
//   return (
//     <>
//       <div className={cn("pb-[200px] pt-4 md:pt-10", className)}>
//         {messages.length ? (
//           <>
//             <ChatList messages={messages} />
//             <ChatScrollAnchor trackVisibility={isLoading} />
//           </>
//         ) : (
//           <EmptyScreen setInput={setInput} />
//         )}
//       </div>
//       <ChatPanel
//         id={id}
//         isLoading={isLoading}
//         stop={stop}
//         append={append}
//         reload={reload}
//         messages={messages}
//         input={input}
//         setInput={setInput}
//       />

//       <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter your OpenAI Key</DialogTitle>
//             <DialogDescription>
//               If you have not obtained your OpenAI API key, you can do so by{" "}
//               <a
//                 href="https://platform.openai.com/signup/"
//                 className="underline"
//               >
//                 signing up
//               </a>{" "}
//               on the OpenAI website. This is only necessary for preview
//               environments so that the open source community can test the app.
//               The token will be saved to your browser&apos;s local storage under
//               the name <code className="font-mono">ai-token</code>.
//             </DialogDescription>
//           </DialogHeader>
//           <Input
//             value={previewTokenInput}
//             placeholder="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"
//             onChange={(e) => setPreviewTokenInput(e.target.value)}
//           />
//           <DialogFooter className="items-center">
//             <Button
//               onClick={() => {
//                 setPreviewToken(previewTokenInput);
//                 setPreviewTokenDialog(false);
//               }}
//             >
//               Save Token
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }
