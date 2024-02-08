// frontend\components\chat\chat-list.tsx

import { ChatMessage } from "@/components/chat/chat-message";
import { MessagesContext } from "@/context/messages";
import { useChatSubscription } from "@/lib/hooks/useSupabaseSubscriptions";
import { nanoid } from "@/lib/utils";
import { Message } from "@/lib/validators/message";
import { useMutation } from "@tanstack/react-query";
import { FC, HTMLAttributes, JSX, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface ChatListProps extends HTMLAttributes<HTMLDivElement> {}

export const ChatList: FC<ChatListProps> = ({ className, ...props }) => {
  const { toast } = useToast();
  const {
    messages,
    addMessage,
    removeMessage,
    updateMessage,
    setIsMessageUpdating,
  } = useContext(MessagesContext);

  console.log(
    `[ChatList] ${getFormattedTimestamp()} - Rendering ChatList component`
  );

  const { mutate: sendMessageMutation, isPending } = useMutation({
    mutationFn: async (_message: Message) => {
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - Mutation function called with message:`,
        _message
      );
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: _message }), // Ensure this matches your backend expectation
      });
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - Fetch response received`
      );
      return response.body;
    },
    onMutate(message) {
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onMutate - message being added:`,
        message
      );
      addMessage(message);
    },
    onSuccess: async (stream) => {
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onSuccess - stream received:`,
        stream
      );
      if (!stream) throw new Error("No stream!");
      const message_id = nanoid();
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onSuccess - generated message ID:`,
        message_id
      );

      const responseMessage: Message = {
        message_id,
        isUserMessage: true,
        content: "",
        speech_end_timestamp: "",
        transcription_time: 0,
        messageType: "chatBotResponse",
      };

      // Add message to context
      addMessage(responseMessage);
      setIsMessageUpdating(true);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          // Check if value is not undefined
          const chunkValue = decoder.decode(value);
          console.log(
            `[ChatList] ${getFormattedTimestamp()} - onSuccess - Received chunk: ${chunkValue}`
          );
          updateMessage(message_id, (prev) => prev + chunkValue);
        }
      }

      setIsMessageUpdating(false);
      console.log(
        `[ChatList] ${getFormattedTimestamp()} - onSuccess - Stream processing complete`
      );
    },
    onError: (_, message) => {
      console.error(
        `[ChatList] ${getFormattedTimestamp()} - onError - Error occurred`,
        message
      );
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      removeMessage(message.message_id);
    },
  });

  useChatSubscription(sendMessageMutation);

  const inverseMessages = [...messages].reverse();
  console.log(`[ChatList] ${getFormattedTimestamp()} - Messages: `, messages);

  return (
    <div
      {...props}
      className="relative mx-auto max-w-2xl px-4 border-2 border-red-400"
    >
      {inverseMessages.map((message) => (
        <div key={`${message.message_id}-${message.message_id}`}>
          <ChatMessage message={message} />
        </div>
      ))}
    </div>
  );
};

// I need help with my code. I just cannot get it right. I'm going to tell you a little bit about my app and then show you some code
function getFormattedTimestamp(): string {
  const now = new Date();
  const timeWithMilliseconds =
    now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) +
    "." +
    String(now.getMilliseconds()).padStart(3, "0");
  const date = now.toLocaleDateString("en-US");
  return `${date}, ${timeWithMilliseconds}`;
}

// async function fetchChatBotResponse(
//   userMessageContent: string
// ): Promise<string> {
//   // Simulate an API call to generate a response based on the userMessageContent
//   // This is where you'd call OpenAI or another service
//   const response = "Generated response based on: " + userMessageContent;
//   return Promise.resolve(response);
// }
