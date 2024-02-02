// frontend\app\api\receive-data\route.ts
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);

    return new Response(
      JSON.stringify({ message: "Data received successfully" }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Error processing request" }), {
      status: 500,
    });
  }
}

// import type { NextApiRequest, NextApiResponse } from "next";

// let clients: any[] = []; // Store for SSE clients

// // Function to broadcast data to all SSE clients
// function broadcastData(data: any) {
//   clients.forEach((client) =>
//     client.write(`data: ${JSON.stringify(data)}\n\n`)
//   );
// }

// // Handle POST requests to receive new data
// export async function POST(request: NextApiRequest, response: NextApiResponse) {
//   try {
//     // Read the stream and parse it into JSON
//     const requestData = await request.body.getReader().read();
//     const data = JSON.parse(new TextDecoder("utf-8").decode(requestData.value));
//     console.log("Received data:", data);

//     // const responseData = { message: "Data received successfully" };

//     // // Broadcast the data to all connected SSE clients
//     // broadcastData(data);
//     // console.log("Broadcasted data to all clients", data);
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return response.status(500).json({ error: "Error processing request" });
//   }

//   return new Response("Data received successfully", { status: 200 });
// }

// Handle GET requests for SSE connection
// export function GET(req: NextApiRequest, res: NextApiResponse) {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Connection", "keep-alive");
//   res.setHeader("Cache-Control", "no-cache");

//   // Add this client to the clients array
//   clients.push(res);

//   // When client closes connection, remove them from the array
//   req.on("close", () => {
//     clients = clients.filter((client) => client !== res);
//   });
// }
