// store/messagesStore.ts
import { create } from "zustand";
import { Message } from "@/lib/validators/message";

interface MessagesState {
    messages: Message[];
    isMessageUpdating: boolean;
    addMessage: (message: Message) => void;
    removeMessage: (message_id: string) => void;
    updateMessage: (
        message_id: string,
        updateFn: (prevText: string) => string,
    ) => void;
    setIsMessageUpdating: (isUpdating: boolean) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
    messages: [],
    isMessageUpdating: false,

    addMessage: (message) => {
        console.debug(`Adding message: ${JSON.stringify(message)}`);
        set((state) => ({ messages: [...state.messages, message] }));
    },

    removeMessage: (message_id) => {
        console.debug(`Removing message with ID: ${message_id}`);
        set((state) => ({
            messages: state.messages.filter(
                (message) => message.message_id !== message_id,
            ),
        }));
    },

    updateMessage: (message_id, updateFn) => {
        console.debug(`Updating message with ID: ${message_id}`);
        set((state) => ({
            messages: state.messages.map((message) =>
                message.message_id === message_id
                    ? { ...message, content: updateFn(message.content) }
                    : message,
            ),
        }));
    },

    setIsMessageUpdating: (isUpdating) => {
        console.debug(`Setting isMessageUpdating to: ${isUpdating}`);
        set({ isMessageUpdating: isUpdating });
    },
}));
