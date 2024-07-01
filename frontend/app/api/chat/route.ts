// // app\api\chat\route.ts
// // Import the OpenAIStream and StreamingTextResponse classes from the "ai" module.
// // These are used for streaming the AI-generated response back to the client.
// import { OpenAIStream, StreamingTextResponse } from "ai";

// // Import the OpenAI class from the "openai" module.
// // This is used to interact with the OpenAI API.
// import OpenAI from "openai";

// // Import the nanoid function from the "@/lib/utils" module.
// // This is used to generate a unique ID for each chat.
// import { nanoid } from "@/lib/utils";

// // Set the runtime to "edge" to enable edge computing capabilities.
// export const runtime = "edge";

// // Create a new instance of the OpenAI class, passing in the API key from environment variables.
// const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
// });

// // Define an asynchronous POST function to handle incoming requests.
// export async function POST(req: Request) {
//     // Parse the JSON payload from the request body.
//     const json = await req.json();

//     // Extract the messages and previewToken from the JSON payload.
//     const { messages, previewToken } = json;

//     // Set the userId to a default value of "local-user".
//     // In a real application, this would typically be obtained from authentication.
//     const userId = "local-user";

//     // If no userId is present, return a 401 Unauthorized response.
//     if (!userId) {
//         return new Response("Unauthorized", {
//             status: 401,
//         });
//     }

//     // If a previewToken is provided, use it as the OpenAI API key.
//     // This allows for testing with a different API key.
//     if (previewToken) {
//         openai.apiKey = previewToken;
//     }

//     // Call the OpenAI API to create a chat completion.
//     // Pass in the model, messages, temperature, and set stream to true.
//     const res = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages,
//         temperature: 0.7,
//         stream: true,
//     });

//     // Create an OpenAIStream instance to stream the response.
//     // Pass in the API response and an onCompletion callback.
//     const stream = OpenAIStream(res, {
//         async onCompletion(completion) {
//             // Extract the first 100 characters of the first message content as the title.
//             const title = json.messages[0].content.substring(0, 100);

//             // Get the chat ID from the JSON payload or generate a new one using nanoid.
//             const id = json.id ?? nanoid();

//             // Get the current timestamp as the creation time.
//             const createdAt = Date.now();

//             // Generate the path for the chat using the ID.
//             const path = `/chat/${id}`;

//             // Create a payload object containing the chat details.
//             const payload = {
//                 id,
//                 title,
//                 userId,
//                 createdAt,
//                 path,
//                 messages: [
//                     ...messages,
//                     {
//                         content: completion,
//                         role: "assistant",
//                     },
//                 ],
//             };

//             // Generate a unique chatId using the chat ID.
//             const chatId = `chat:${id}`;

//             // The saveChatData and getChatData functions are commented out.
//             // They would typically be used to save and retrieve chat data from a database or storage system.
//             // await saveChatData(chatId, payload);
//             // await getChatData(chatId);
//         },
//     });

//     // Return a new StreamingTextResponse with the OpenAIStream.
//     // This streams the AI-generated response back to the client.
//     return new StreamingTextResponse(stream);
// }

// ---
// --- Below is the code without comments and console logs
// ---

// app\api\chat\route.ts
import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";
import { nanoid } from "@/lib/utils";

export const runtime = "edge";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    const json = await req.json();

    const { messages, previewToken } = json;

    const userId = "local-user";

    if (!userId) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    if (previewToken) {
        openai.apiKey = previewToken;
    }

    // Call the OpenAI API to create a chat completion.
    // Pass in the model, messages, temperature, and set stream to true.
    const res = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.7,
        stream: true,
    });

    // Create an OpenAIStream instance to stream the response.
    // Pass in the API response and an onCompletion callback.
    const stream = OpenAIStream(res, {
        async onCompletion(completion) {
            // Extract the first 100 characters of the first message content as the title.
            const title = json.messages[0].content.substring(0, 100);

            // Get the chat ID from the JSON payload or generate a new one using nanoid.
            const id = json.id ?? nanoid();

            // Get the current timestamp as the creation time.
            const createdAt = Date.now();

            // Generate the path for the chat using the ID.
            const path = `/chat/${id}`;

            // Create a payload object containing the chat details.
            const payload = {
                id,
                title,
                userId,
                createdAt,
                path,
                messages: [
                    ...messages,
                    {
                        content: completion,
                        role: "assistant",
                    },
                ],
            };

            // Generate a unique chatId using the chat ID.
            const chatId = `chat:${id}`;

            // The saveChatData and getChatData functions are commented out.
            // They would typically be used to save and retrieve chat data from a database or storage system.
            // await saveChatData(chatId, payload);
            // await getChatData(chatId);
        },
    });

    // Return a new StreamingTextResponse with the OpenAIStream.
    // This streams the AI-generated response back to the client.
    return new StreamingTextResponse(stream);
}
