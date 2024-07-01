// frontend\app\(chat)\page.tsx
import { nanoid } from "@/lib/utils";
import { Chat } from "@/components/chat/chat";
/**
 * This is the main page component for the chat functionality.
 * It generates a unique chat ID using the nanoid utility function
 * and renders the Chat component, passing the chat ID as a prop.
 *
 * The Chat component is responsible for handling the actual chat
 * functionality, including displaying messages, handling user input,
 * and communicating with the backend API.
 *
 * By generating a new chat ID each time this page is loaded, we ensure
 * that each chat session is unique and isolated from others.
 */

export default function IndexPage() {
    /**
     * Generate a unique chat ID using the nanoid utility function.
     *
     * nanoid is a lightweight, secure, URL-friendly unique string ID
     * generator. It creates a random string of characters that can be
     * used as a unique identifier for various purposes, such as session
     * IDs, database keys, or in this case, chat IDs.
     *
     * By generating a new chat ID each time the page is loaded, we
     * ensure that each chat session is separate and not mixed with
     * previous or concurrent chats.
     */
    const chat_id = nanoid();

    /**
     * Render the Chat component, passing the generated chat ID as a prop.
     *
     * The Chat component is responsible for handling the actual chat UI
     * and functionality. It likely displays chat messages, provides an
     * input for the user to send new messages, and communicates with the
     * backend API to send and receive chat data.
     *
     * By passing the chat ID as a prop, we allow the Chat component to
     * associate the messages and interactions with this specific chat
     * session, identified by the unique chat ID.
     */
    return <Chat chat_id={chat_id} />;
}

// ---
// --- Below is the code without comments and console logs
// ---

// // frontend\app\(chat)\page.tsx
// import { nanoid } from "@/lib/utils";
// import { Chat } from "@/components/chat/chat";

// export default function IndexPage() {
//   const chat_id = nanoid();

//   return <Chat chat_id={chat_id} />;
// }
