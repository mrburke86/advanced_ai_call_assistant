// // frontend\app\api\receive-data\route.ts

// /**
//  * POST request handler for receiving and processing data.
//  *
//  * This handler expects the request body to contain JSON data.
//  * It logs the received data to the console and returns a JSON response
//  * indicating the success or failure of the data processing.
//  *
//  * @param {Request} request - The incoming request object.
//  * @returns {Promise<Response>} - A promise that resolves to the response object.
//  */
// export async function POST(request: Request) {
//   try {
//     // Parse the JSON data from the request body
//     const data = await request.json();

//     // Log the received data to the console for debugging purposes
//     console.log("Received data:", data);

//     // Create a success response with a JSON payload and appropriate headers
//     return new Response(
//       JSON.stringify({ message: "Data received successfully" }),
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//         status: 200,
//       }
//     );
//   } catch (error) {
//     // Log any errors that occur during request processing
//     console.error("Error processing request:", error);

//     // Create an error response with a JSON payload and a 500 status code
//     return new Response(JSON.stringify({ error: "Error processing request" }), {
//       status: 500,
//     });
//   }
// }

// ---
// --- Below is a test integration of Zustand
// ---

// frontend/app/api/receive-data/route.ts
import { useMessagesStore } from "@/store/messagesStore";

export async function POST(request: Request) {
    try {
        const data = await request.json();

        console.log(`Received data: ${JSON.stringify(data)}`);

        const { addMessage } = useMessagesStore.getState();
        addMessage(data);

        return new Response(
            JSON.stringify({ message: "Data received successfully" }),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 200,
            },
        );
    } catch (error: unknown) {
        // Change here
        const errorMessage =
            error instanceof Error ? error.message : "Error processing request";
        console.error("Error processing request:", errorMessage);

        return new Response(
            JSON.stringify({
                error: "Error processing request",
                details: errorMessage,
            }),
            {
                status: 500,
            },
        );
    }
}
