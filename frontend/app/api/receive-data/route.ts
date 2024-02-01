// frontend\app\api\receive-data\route.ts
export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Received data:", data);
    // Process the data as needed

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
