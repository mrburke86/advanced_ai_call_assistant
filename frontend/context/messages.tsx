// frontend\context\messages.tsx

import { createContext, useState } from "react";
import { Message } from "@/lib/validators/message";

/**
 * This file defines the MessagesContext and MessagesProvider components, which are used to manage
 * the state and functionality related to messages in the application.
 *
 * The MessagesContext is a React context that provides access to the messages state and functions
 * for adding, removing, and updating messages. It also includes a flag to indicate if a message
 * is currently being updated.
 *
 * The MessagesProvider is a React component that wraps the MessagesContext and provides the
 * implementation for the message-related functions. It manages the messages state using the
 * useState hook and passes the state and functions to the MessagesContext.Provider.
 *
 * The Message type, imported from "@/lib/validators/message", represents the structure of a message
 * object used throughout the application.
 */

/**
 * The defaultValue is an array containing a single default message object. This is used as the
 * initial value for the messages state in the MessagesProvider.
 */
const defaultValue = [
    {
        message_id: "",
        messageType: "",
        isUserMessage: false,
        content: "Are you ready to get started?",
        speech_end_timestamp: "",
        transcription_time: 0,
    },
];

/**
 * The MessagesContext is a React context that provides access to the messages state and functions
 * for adding, removing, and updating messages. It also includes a flag to indicate if a message
 * is currently being updated.
 *
 * The context is initialized with default values for each property, which will be overridden by
 * the MessagesProvider when it renders the context provider.
 */
export const MessagesContext = createContext<{
    messages: Message[];
    isMessageUpdating: boolean;
    addMessage: (message: Message) => void;
    removeMessage: (message_id: string) => void;
    updateMessage: (
        message_id: string,
        updateFn: (prevText: string) => string,
    ) => void;
    setIsMessageUpdating: (isUpdating: boolean) => void;
}>({
    messages: [],
    isMessageUpdating: false,
    addMessage: () => {},
    removeMessage: () => {},
    updateMessage: () => {},
    setIsMessageUpdating: () => {},
});

/**
 * The MessagesProvider is a React component that wraps the MessagesContext and provides the
 * implementation for the message-related functions. It manages the messages state using the
 * useState hook and passes the state and functions to the MessagesContext.Provider.
 *
 * @param {Object} props - The props object containing the children components to be wrapped.
 * @param {React.ReactNode} props.children - The children components to be wrapped by the provider.
 */
export function MessagesProvider({ children }: { children: React.ReactNode }) {
    /**
     * The messages state is an array of Message objects representing the list of messages in the chat.
     * It is initialized with the defaultValue array and updated using the setMessages function.
     */
    const [messages, setMessages] = useState(defaultValue);

    /**
     * The isMessageUpdating state is a boolean flag indicating whether a message is currently being updated.
     * It is initialized as false and updated using the setIsMessageUpdating function.
     */
    const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false);

    /**
     * The addMessage function adds a new message to the messages state by appending it to the existing array.
     *
     * @param {Message} message - The message object to be added to the messages state.
     */
    const addMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
    };

    /**
     * The removeMessage function removes a message from the messages state based on its message_id.
     *
     * @param {string} message_id - The ID of the message to be removed.
     */
    const removeMessage = (message_id: string) => {
        setMessages((prev) =>
            prev.filter((message) => message.message_id !== message_id),
        );
    };

    /**
     * The updateMessage function updates the content of a message in the messages state based on its message_id.
     *
     * @param {string} message_id - The ID of the message to be updated.
     * @param {Function} updateFn - A function that takes the previous content of the message and returns the updated content.
     */
    const updateMessage = (
        message_id: string,
        updateFn: (prevText: string) => string,
    ) => {
        setMessages((prev) =>
            prev.map((message) => {
                if (message.message_id === message_id) {
                    return { ...message, content: updateFn(message.content) };
                }
                return message;
            }),
        );
    };

    /**
     * The MessagesProvider returns the MessagesContext.Provider component, which provides the messages state
     * and message-related functions to its children components.
     */
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

// ---
// --- Below is the code without comments and console logs
// ---

// // frontend\context\messages.tsx
// import { createContext, useState } from "react";
// import { Message } from "@/lib/validators/message";

// const defaultValue = [
//   {
//     message_id: "",
//     messageType: "",
//     isUserMessage: false,
//     content: "Are you ready to get started?",
//     speech_end_timestamp: "",
//     transcription_time: 0,
//   },
// ];

// export const MessagesContext = createContext<{
//   messages: Message[];
//   isMessageUpdating: boolean;
//   addMessage: (message: Message) => void;
//   removeMessage: (message_id: string) => void;
//   updateMessage: (
//     message_id: string,
//     updateFn: (prevText: string) => string
//   ) => void;
//   setIsMessageUpdating: (isUpdating: boolean) => void;
// }>({
//   messages: [],
//   isMessageUpdating: false,
//   addMessage: () => {},
//   removeMessage: () => {},
//   updateMessage: () => {},
//   setIsMessageUpdating: () => {},
// });

// export function MessagesProvider({ children }: { children: React.ReactNode }) {
//   const [messages, setMessages] = useState(defaultValue);
//   const [isMessageUpdating, setIsMessageUpdating] = useState<boolean>(false);

//   const addMessage = (message: Message) => {
//     setMessages((prev) => [...prev, message]);
//   };

//   const removeMessage = (message_id: string) => {
//     setMessages((prev) =>
//       prev.filter((message) => message.message_id !== message_id)
//     );
//   };

//   const updateMessage = (
//     message_id: string,
//     updateFn: (prevText: string) => string
//   ) => {
//     setMessages((prev) =>
//       prev.map((message) => {
//         if (message.message_id === message_id) {
//           return { ...message, content: updateFn(message.content) };
//         }
//         return message;
//       })
//     );
//   };

//   return (
//     <MessagesContext.Provider
//       value={{
//         messages,
//         isMessageUpdating,
//         addMessage,
//         removeMessage,
//         updateMessage,
//         setIsMessageUpdating,
//       }}
//     >
//       {children}
//     </MessagesContext.Provider>
//   );
// }
