// frontend\app\api\message\route.ts
import { chatbotPrompt } from "@/helpers/constants/chatbot-prompt";
import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "@/lib/openai-stream";
import { MessageArraySchema } from "@/lib/validators/message";

const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "";

export async function POST(req: Request) {
  try {
    // Extract messages (from MessagesContext state)
    const { messages } = await req.json();
    console.log(
      "\n\n\n\n\n[Messages Route] Received messages (from MessageContext):",
      messages
    );

    // Validate messages against MessageArraySchema
    const parsedMessages = MessageArraySchema.parse(messages);

    // Convert messages to OpenAIStreamPayload
    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => {
      return {
        role: message.isUserMessage ? "user" : "system",
        content: `${message.content}`,
      };
    });

    // Add chatbotPrompt to outboundMessages as system message at the beginning
    outboundMessages.unshift({
      role: "system",
      content: chatbotPrompt,
    });
    console.log("[Messages Route] Outbound messages:", outboundMessages);

    // Create OpenAIStreamPayload from outboundMessages
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
      return new Response(stream);
    } catch (streamError) {
      console.error("Error initiating OpenAI stream:", streamError);
      return new Response(
        JSON.stringify({ error: "Failed to initiate chatbot stream" }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in POST function:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), {
      status: 500,
    });
  }
}
