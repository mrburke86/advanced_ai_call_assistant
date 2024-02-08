// frontend\context\messages.tsx
import { createContext, useState } from "react";
import { Message } from "@/lib/validators/message";

const defaultValue = [
  {
    message_id: "",
    messageType: "",
    isUserMessage: false,
    content: "Lets fucking go, boy!!",
    speech_end_timestamp: "",
    transcription_time: 0,
  },
];

export const MessagesContext = createContext<{
  messages: Message[];
  isMessageUpdating: boolean;
  addMessage: (message: Message) => void;
  removeMessage: (message_id: string) => void;
  updateMessage: (message_id: string, updateFn: (prevText: string) => string) => void;
  setIsMessageUpdating: (isUpdating: boolean) => void;
}>({
  messages: [],
  isMessageUpdating: false,
  addMessage: () => {},
  removeMessage: () => {},
  updateMessage: () => {},
  setIsMessageUpdating: () => {},
});

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState(defaultValue);
  const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false);

  // Add Message
  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  // Remove Message
  const removeMessage = (message_id: string) => {
    setMessages((prev) => prev.filter((message) => message.message_id !== message_id));
  };

  // Update Messageq
  const updateMessage = (
    message_id: string,
    updateFn: (prevText: string) => string
  ) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.message_id === message_id) {
          return { ...message, content: updateFn(message.content) };
        }
        return message;
      })
    );
  };

  return (
    <MessagesContext.Provider
      value={{
        messages,
        isMessageUpdating,
        addMessage,
        removeMessage,
        updateMessage,
        setIsMessageUpdating,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
}
