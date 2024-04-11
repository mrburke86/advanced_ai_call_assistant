// frontend\app\api\message\route.ts
import { chatbotPrompt } from "@/helpers/constants/chatbot-prompt";
import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "@/lib/openai-stream";
import { MessageArraySchema } from "@/lib/validators/message";

/**
 * This module handles the API route for processing messages and interacting with the OpenAI API.
 * It receives an array of messages, validates them, and sends them to the OpenAI API to generate a response.
 * The response is then streamed back to the client.
 */

// Get the OpenAI API model from environment variables or use a default value
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "";

/**
 * POST request handler for the message API route.
 * @param req The incoming request object.
 * @returns A Response object containing the generated response from the OpenAI API.
 */
export async function POST(req: Request) {
  try {
    // Extract the messages from the request body
    const { messages } = await req.json();
    console.log(
      "\n\n\n\n\n[Messages Route] Received messages (from MessageContext):",
      messages
    );

    // Validate the received messages using the MessageArraySchema
    const parsedMessages = MessageArraySchema.parse(messages);

    // Map the parsed messages to the ChatGPTMessage format
    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => {
      return {
        role: message.isUserMessage ? "user" : "system",
        content: `${message.content}`,
      };
    });

    // Add the chatbot prompt as the first message in the outbound messages array
    outboundMessages.unshift({
      role: "system",
      content: chatbotPrompt,
    });
    console.log("[Messages Route] Outbound messages:", outboundMessages);

    // Prepare the payload for the OpenAI API request
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
      // Send the payload to the OpenAI API and get the response stream
      const stream = await OpenAIStream(payload);
      // Return the response stream to the client
      return new Response(stream);
    } catch (streamError) {
      // Handle errors related to initiating the OpenAI stream
      console.error("Error initiating OpenAI stream:", streamError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate chatbot stream" }),
        { status: 500 }
      );
    }
  } catch (error) {
    // Handle any unexpected errors in the POST function
    console.error("Unexpected error in POST function:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
    });
  }
}
