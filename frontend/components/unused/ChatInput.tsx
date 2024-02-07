// "use client";

// import { MessagesContext } from "@/context/messages";
// import {
//   subscribeToTranscriptions,
//   unsubscribeFromTranscriptions,
// } from "@/lib/supabaseSubscriptions";
// import { cn } from "@/lib/utils";
// import { Message } from "@/lib/validators/message";
// import { useMutation } from "@tanstack/react-query";
// import { nanoid } from "nanoid";
// import {
//   FC,
//   HTMLAttributes,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from "react";
// import { toast } from "react-hot-toast";

// interface ChatInputProps extends HTMLAttributes<HTMLDivElement> {}

// export function ChatInput() {
//   const {
//     messages,
//     addMessage,
//     removeMessage,
//     updateMessage,
//     setIsMessageUpdating,
//   } = useContext(MessagesContext);

//   // useEffect(() => {
//   //   // Subscribe to Supabase real-time updates
//   //   const subscription = subscribeToTranscriptions((payload) => {
//   //     addMessage({
//   //       id: payload.new.id,
//   //       isUserMessage: false,
//   //       text: payload.new.content,
//   //       // Add other fields from payload as needed
//   //     });
//   //   });

//   //   // Cleanup subscription on component unmount
//   //   return () => unsubscribeFromTranscriptions(subscription);
//   // }, []); // Add dependencies as necessary, e.g., addMessage, currentUserID

//   // const message: Message = {
//   //   id: nanoid(),
//   //   isUserMessage: true,
//   //   text: "",
//   };

//   const { mutate: text, isLoading } = useMutation({
//     mutationFn: async (_message: Message) => {
//       const response = await fetch("/api/message", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ messages }),
//       });

//       return response.body;
//     },
//     onMutate(message) {
//       addMessage(message);
//     },
//     onSuccess: async (stream) => {
//       if (!stream) throw new Error("No stream");

//       // construct new message to add
//       const id = nanoid();
//       const responseMessage: Message = {
//         id,
//         isUserMessage: false,
//         text: "",
//       };

//       // add new message to state
//       addMessage(responseMessage);

//       setIsMessageUpdating(true);

//       const reader = stream.getReader();
//       const decoder = new TextDecoder();
//       let done = false;

//       while (!done) {
//         const { value, done: doneReading } = await reader.read();
//         done = doneReading;
//         const chunkValue = decoder.decode(value);
//         updateMessage(id, (prev) => prev + chunkValue);
//       }

//       // clean up
//       setIsMessageUpdating(false);
//       // setInput("");

//       setTimeout(() => {
//         textareaRef.current?.focus();
//       }, 10);
//     },
//     onError: (_, message) => {
//       toast.error("Something went wrong. Please try again.");
//       removeMessage(message.id);
//       textareaRef.current?.focus();
//     },
//   });

//   return message;
// }
