// frontend\lib\openai-stream.ts

import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

/**
 * This module provides a function for streaming OpenAI API responses.
 * It uses the eventsource-parser library to parse the streamed data
 * and returns a ReadableStream that can be consumed by the client.
 *
 * The main export is the OpenAIStream function, which takes an
 * OpenAIStreamPayload object as input and returns a Promise that
 * resolves to a ReadableStream.
 *
 * The OpenAIStreamPayload interface defines the structure of the
 * payload object, which includes the model name, messages, and
 * various configuration options for the API request.
 *
 * The ChatGPTMessage interface defines the structure of a message
 * object, which includes a role (either "user" or "system") and
 * the message content.
 *
 * The module uses the fetch API to send a POST request to the
 * OpenAI API endpoint, passing the payload object in the request
 * body. The API key is included in the Authorization header.
 *
 * The response is then processed using the eventsource-parser
 * library, which parses the streamed data and emits events for
 * each chunk of data. The onParse function handles these events,
 * extracting the message content from the JSON data and enqueueing
 * it in the ReadableStream.
 *
 * The ReadableStream is created with a start function that sets
 * up the parser and feeds the chunked data to it. Once the stream
 * is complete, the controller is closed.
 *
 * The module also includes some basic error handling, catching
 * any errors that occur during parsing and passing them to the
 * controller's error method.
 */

/**
 * Defines the possible roles for a ChatGPTMessage.
 * @typedef {"user" | "system"} ChatGPTAgent
 */
export type ChatGPTAgent = "user" | "system";

/**
 * Defines the structure of a message object.
 * @interface ChatGPTMessage
 * @property {ChatGPTAgent} role - The role of the message sender, either "user" or "system".
 * @property {string} content - The content of the message.
 */
export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

/**
 * Defines the structure of the payload object for the OpenAI API request.
 * @interface OpenAIStreamPayload
 * @property {string} model - The name of the OpenAI model to use.
 * @property {ChatGPTMessage[]} messages - An array of message objects.
 * @property {number} temperature - The sampling temperature to use, between 0 and 2.
 * @property {number} top_p - The top-p sampling parameter, between 0 and 1.
 * @property {number} frequency_penalty - The frequency penalty to apply, between -2 and 2.
 * @property {number} presence_penalty - The presence penalty to apply, between -2 and 2.
 * @property {number} max_tokens - The maximum number of tokens to generate.
 * @property {boolean} stream - Whether to stream the response or not.
 * @property {number} n - The number of responses to generate.
 */
export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

/**
 * Sends a request to the OpenAI API and returns a ReadableStream of the response.
 * @param {OpenAIStreamPayload} payload - The payload object for the API request.
 * @returns {Promise<ReadableStream>} A Promise that resolves to a ReadableStream of the response.
 */
export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  // Send a POST request to the OpenAI API with the given payload
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Create a new ReadableStream to handle the response
  const stream = new ReadableStream({
    async start(controller) {
      /**
       * Handles a parsed event from the API response.
       * @param {ParsedEvent | ReconnectInterval} event - The parsed event.
       */
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;

          // If the data is "[DONE]", close the stream
          if (data === "[DONE]") {
            controller.close();
            return;
          }

          // Parse the JSON data and extract the message content
          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta?.content || "";

            // Ignore the first two messages if they contain a newline character
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }

            // Enqueue the message content in the ReadableStream
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            // If there's an error parsing the JSON, pass it to the controller
            controller.error(e);
          }
        }
      }

      // Create a new parser and feed the response body to it
      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
