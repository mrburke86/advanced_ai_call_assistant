// // frontend\lib\chatStorage.ts
// import Redis from "ioredis";

// // Connect to Redis
// const redisClient = new Redis({
//   host: "localhost", // or your Docker Redis host
//   port: 6379, // default Redis port
// });

// redisClient.on("error", (err) => console.log("Redis Client Error", err));

// export async function saveChatData(chatId: string, payload: any) {
//   await redisClient.set(`chat:${chatId}`, JSON.stringify(payload));
// }

// export async function getChatData(chatId: string) {
//   try {
//     const data = await redisClient.get(`chat:${chatId}`);
//     return JSON.parse(data || "{}");
//   } catch (error) {
//     console.error("Error reading chat data:", error);
//     return null; // Or handle the error as you prefer
//   }
// }
