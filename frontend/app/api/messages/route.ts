// // frontend\app\api\message\route.ts
// import { chatbotPrompt } from "@/helpers/constants/chatbot-prompt";
// import {
//     ChatGPTMessage,
//     OpenAIStream,
//     OpenAIStreamPayload,
// } from "@/lib/openai-stream";
// import { MessageArraySchema } from "@/lib/validators/message";

// /**
//  * This module handles the API route for processing messages and interacting with the OpenAI API.
//  * It receives an array of messages, validates them, and sends them to the OpenAI API to generate a response.
//  * The response is then streamed back to the client.
//  */

// // Get the OpenAI API model from environment variables or use a default value
// const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "";

// /**
//  * POST request handler for the message API route.
//  * @param req The incoming request object.
//  * @returns A Response object containing the generated response from the OpenAI API.
//  */
// export async function POST(req: Request) {
//     try {
//         // Extract the messages from the request body
//         const { messages } = await req.json();
//         console.log(
//             "\n\n\n\n\n[Messages Route] Received messages (from MessageContext):",
//             messages,
//         );

//         // Validate the received messages using the MessageArraySchema
//         const parsedMessages = MessageArraySchema.parse(messages);

//         // Map the parsed messages to the ChatGPTMessage format
//         const outboundMessages: ChatGPTMessage[] = parsedMessages.map(
//             (message) => {
//                 return {
//                     role: message.isUserMessage ? "user" : "system",
//                     content: `${message.content}`,
//                 };
//             },
//         );

//         // Add the chatbot prompt as the first message in the outbound messages array
//         outboundMessages.unshift({
//             role: "system",
//             content: chatbotPrompt,
//         });
//         console.log("[Messages Route] Outbound messages:", outboundMessages);

//         // Prepare the payload for the OpenAI API request
//         const payload: OpenAIStreamPayload = {
//             model: OPENAI_API_MODEL,
//             messages: outboundMessages,
//             temperature: 0.4,
//             top_p: 1,
//             frequency_penalty: 0,
//             presence_penalty: 0,
//             max_tokens: 900,
//             stream: true,
//             n: 1,
//         };

//         try {
//             // Send the payload to the OpenAI API and get the response stream
//             const stream = await OpenAIStream(payload);
//             // Return the response stream to the client
//             return new Response(stream);
//         } catch (streamError) {
//             // Handle errors related to initiating the OpenAI stream
//             console.error("Error initiating OpenAI stream:", streamError);
//             return new Response(
//                 JSON.stringify({ error: "Failed to initiate chatbot stream" }),
//                 { status: 500 },
//             );
//         }
//     } catch (error) {
//         // Handle any unexpected errors in the POST function
//         console.error("Unexpected error in POST function:", error);
//         return new Response(
//             JSON.stringify({ error: "Unexpected server error" }),
//             {
//                 status: 500,
//             },
//         );
//     }
// }

// ---
// --- Below is the code without comments and console logs
// ---

// // frontend\app\api\message\route.ts
// import { chatbotPrompt } from "@/helpers/constants/chatbot-prompt";
// import {
//   ChatGPTMessage,
//   OpenAIStream,
//   OpenAIStreamPayload,
// } from "@/lib/openai-stream";
// import { MessageArraySchema } from "@/lib/validators/message";

// const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "";

// export async function POST(req: Request) {
//   try {
//     const { messages } = await req.json();

//     const parsedMessages = MessageArraySchema.parse(messages);

//     const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => {
//       return {
//         role: message.isUserMessage ? "user" : "system",
//         content: `${message.content}`,
//       };
//     });

//     outboundMessages.unshift({
//       role: "system",
//       content: chatbotPrompt,
//     });

//     const payload: OpenAIStreamPayload = {
//       model: OPENAI_API_MODEL,
//       messages: outboundMessages,
//       temperature: 0.4,
//       top_p: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//       max_tokens: 900,
//       stream: true,
//       n: 1,
//     };

//     try {
//       const stream = await OpenAIStream(payload);

//       return new Response(stream);
//     } catch (streamError) {

//       return new Response(
//         JSON.stringify({ error: "Failed to initiate chatbot stream" }),
//         { status: 500 }
//       );
//     }
//   } catch (error) {
//     return new Response(JSON.stringify({ error: "Unexpected server error" }), {
//       status: 500,
//     });
//   }
// }

// ---
// --- Below is a test integration of Zustand
// ---

// frontend\app\api\message\route.ts
import { chatbotPrompt } from "@/helpers/constants/chatbot-prompt";
import {
    ChatGPTMessage,
    OpenAIStream,
    OpenAIStreamPayload,
} from "@/lib/openai-stream";
import { MessageArraySchema } from "@/lib/validators/message";
import { WebSocketServer } from "ws";
import { Server } from "http";

const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "";

let wss: WebSocketServer;

export function initializeWebSocketServer(server: Server) {
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            console.debug(`Received WebSocket message: ${message}`);
        });

        ws.on("close", () => {
            console.debug("WebSocket connection closed");
        });
    });
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Log received messages
        console.debug(`Received messages: ${JSON.stringify(messages)}`);

        const parsedMessages = MessageArraySchema.parse(messages);

        const outboundMessages: ChatGPTMessage[] = parsedMessages.map(
            (message) => ({
                role: message.isUserMessage ? "user" : "system",
                content: `${message.content}`,
            }),
        );

        outboundMessages.unshift({
            role: "system",
            content: chatbotPrompt,
        });

        const payload: OpenAIStreamPayload = {
            model: OPENAI_API_MODEL,
            messages: outboundMessages,
            temperature: 0.4,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 900,
            stream: true,
            n: 1,
        };

        try {
            const stream = await OpenAIStream(payload);

            if (wss) {
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(
                            JSON.stringify({
                                messages: parsedMessages,
                                stream,
                            }),
                        );
                    }
                });
            }

            return new Response(stream);
        } catch (streamError: unknown) {
            // Change here
            const errorMessage =
                streamError instanceof Error
                    ? streamError.message
                    : "Unknown stream error";
            return new Response(
                JSON.stringify({
                    error: "Failed to initiate chatbot stream",
                    details: errorMessage,
                }),
                { status: 500 },
            );
        }
    } catch (error: unknown) {
        // Change here
        const errorMessage =
            error instanceof Error ? error.message : "Unexpected server error";
        console.error(`Error processing request: ${errorMessage}`);
        return new Response(
            JSON.stringify({
                error: "Unexpected server error",
                details: errorMessage,
            }),
            {
                status: 500,
            },
        );
    }
}
