// frontend\app\api\message\route.ts 
import { chatbotPrompt } from "@/helpers/constants/chatbot-prompt";
import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "@/lib/openai-stream";
import { MessageArraySchema } from "@/lib/validators/message";

export async function POST(req: Request) {
  try {
  const { messages } = await req.json();
  console.log("[Messages Route] Received messages:", messages);

  const parsedMessages = MessageArraySchema.parse(messages);

  const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => {
    return {
      role: message.isUserMessage ? "user" : "system",
      content: message.content,
    };
  });

  outboundMessages.unshift({
    role: "system",
    content: chatbotPrompt,
  });
  console.log("[Messages Route] Outbound messages:", outboundMessages);

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: outboundMessages,
    temperature: 0.4,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 150,
    stream: true,
    n: 1,
  };

  try {
    const stream = await OpenAIStream(payload);
    return new Response(stream);
  } catch (streamError) {
    console.error("Error initiating OpenAI stream:", streamError);
    return new Response(JSON.stringify({ error: "Failed to initiate chatbot stream" }), { status: 500 });
  }
} catch (error) {
  console.error("Unexpected error in POST function:", error);
  return new Response(JSON.stringify({ error: "Unexpected server error" }), { status: 500 });
}
}
