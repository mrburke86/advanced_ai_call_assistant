// //

// ////// JavaScript environment that doesn't have access to Node.js modules. We need to replace the fs module with Redis instead. //////
// import { promises as fs } from 'fs';
// import path from 'path';

// // Define a directory for chat data
// const CHAT_DIR = path.resolve(__dirname, 'chat_data');

// // Make sure the directory exists
// fs.mkdir(CHAT_DIR, { recursive: true }).catch(console.error);

// export async function saveChatData(chatId: string, payload: { id: any; title: any; userId: string; createdAt: number; path: string; messages: any[]; }) {
//     const filePath = path.join(CHAT_DIR, `chat_${chatId}.json`);
//     await fs.writeFile(filePath, JSON.stringify(payload));
//   }

//   export async function getChatData(chatId: string) {
//     const filePath = path.join(CHAT_DIR, `chat_${chatId}.json`);
//     try {
//       const data = await fs.readFile(filePath, 'utf8');
//       return JSON.parse(data);
//     } catch (error) {
//       console.error('Error reading chat data:', error);
//       return null; // Or handle the error as you prefer
//     }
//   }
