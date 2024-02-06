// frontend\components\chat\chat.tsx
"use client";

import { cn } from "@/lib/utils";
import { ChatList } from "@/components/chat/chat-list";
import { EmptyScreen } from "@/components/empty-screen";
import { FC, HTMLAttributes, useEffect, useState } from "react";
// import ChatInput from "../new-chat/ChatInput";
import { createClient } from "@supabase/supabase-js";
// import { channel } from "diagnostics_channel";
// import TextareaAutosize from "react-textarea-autosize";
import { Message } from "@/lib/validators/message";
import { useMutation } from "@tanstack/react-query";

const SUPABASE_ACCESS_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MDY5MTg0MDAsCiAgImV4cCI6IDE4NjQ3NzEyMDAKfQ.I6ZIUDFnXtjzNjkLPj_1B8BThU9ZdrNaZhXpG-5_KeA";

const SUPABASE_URL = "http://localhost:8000";

export interface ChatProps extends React.ComponentProps<"div"> {
  initialMessages?: Message[];
  id?: string;
}
const supabase = createClient(SUPABASE_URL || "", SUPABASE_ACCESS_TOKEN || "");

export function Chat({ id, initialMessages, className }: ChatProps) {
  const [payloads, setPayloads] = useState<Message[]>([]);

  const handleInserts = (payload: any) => {
    console.log("Change received!", payload);

    // Convert payload to match the Message type structure
    const updatedPayload: Message = {
      id: payload.new.id,
      isUserMessage: true,
      content: payload.new.content,
      create_at: payload.new.create_at,
      data_sent_timestamp: payload.new.data_sent_timestamp,
      speech_end_timestamp: payload.new.speech_end_timestamp,
      speech_length: payload.new.speech_length,
      transcription_end_timestamp: payload.new.transcription_end_timestamp,
      transcription_id: payload.new.transcription_id,
      transcription_time: payload.new.transcription_timestamp,
      user_id: payload.new.user_id,
    };

    // Update state with the new payload
    setPayloads((prevPayloads) => [...prevPayloads, updatedPayload]);
  };

  useEffect(() => {
    // Subscribe to Supabase channel
    const subscription = supabase
      .channel("transcriptions_table")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transcriptions_table" },
        handleInserts
      )
      .subscribe();
    console.log("[Chat] Subscription: ", subscription);
    console.log("[Chat] Payloads: ", payloads);

    // Clean up subscription on component unmount
    return () => {
      subscription.untrack(subscription);
    };
  }, [payloads]);

  const { mutate: updatedPayload, isLoading } = useMutation({
    mutationFn: async (updatedPayload: Message) => {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: "hello",
        }),
      });

      return response.body;
    },
    onSuccess: () => {
      console.log("Message sent successfully!");
    },
  });

  return (
    <>
      <div
        className={cn(
          "border-2 border-blue-400 pb-[200px] pt-4 md:pt-10",
          className
        )}
      >
        <ChatList messages={payloads} />
      </div>
    </>
  );
}

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
