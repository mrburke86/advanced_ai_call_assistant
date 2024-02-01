// frontend\app\actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { kv } from "@vercel/kv";

// import { auth } from "@/auth";
import { type Chat } from "@/lib/types";

export async function getChats(userId?: string | null) {
  if (!userId) {
    return [];
  }

  try {
    const pipeline = kv.pipeline();
    const chats: string[] = await kv.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true,
    });

    for (const chat of chats) {
      pipeline.hgetall(chat);
    }

    const results = await pipeline.exec();

    return results as Chat[];
  } catch (error) {
    return [];
  }
}

export async function getChat(id: string, userId: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`);

  if (!chat || (userId && chat.userId !== userId)) {
    return null;
  }

  return chat;
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  // const session = await auth();

  // if (!session) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }

  const uid = await kv.hget<string>(`chat:${id}`, "userId");
  const defaultUserId = 'local-user'

  if (uid === defaultUserId) {
    await kv.del(`chat:${id}`)
    await kv.zrem(`user:chat:${defaultUserId}`, `chat:${id}`)

    revalidatePath('/')
    return revalidatePath(path)
  } else {
    return { error: 'Unauthorized' }
  }

  // if (uid !== session?.user?.id) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }

  // await kv.del(`chat:${id}`);
  // await kv.zrem(`user:chat:${session.user.id}`, `chat:${id}`);

  // revalidatePath("/");
  // return revalidatePath(path);
}

export async function clearChats() {
  // const session = await auth();

  // if (!session?.user?.id) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }

  const defaultUserId = 'local-user'

  // const chats: string[] = await kv.zrange(
  //   `user:chat:${session.user.id}`,
  //   0,
  //   -1
  // );
  // if (!chats.length) {
  //   return redirect("/");
  // }

  const chats: string[] = await kv.zrange(`user:chat:${defaultUserId}`, 0, -1)
  if (!chats.length) {
    return redirect('/')
  }

  const pipeline = kv.pipeline();

  // for (const chat of chats) {
  //   pipeline.del(chat);
  //   pipeline.zrem(`user:chat:${session.user.id}`, chat);
  // }

  for (const chat of chats) {
    pipeline.del(chat)
    pipeline.zrem(`user:chat:${defaultUserId}`, chat)
  }

  await pipeline.exec();

  revalidatePath("/");
  return redirect("/");
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`);

  if (!chat || !chat.sharePath) {
    return null;
  }

  return chat;
}

export async function shareChat(id: string) {
  // const session = await auth();

  // if (!session?.user?.id) {
  //   return {
  //     error: "Unauthorized",
  //   };
  // }

  const chat = await kv.hgetall<Chat>(`chat:${id}`);

    // Assuming a default user ID for local development
    const defaultUserId = 'local-user' // Replace with a suitable default

  // if (!chat || chat.userId !== session.user.id) {
  //   return {
  //     error: "Something went wrong",
  //   };
  // }

  if (!chat || chat.userId !== defaultUserId) {
    return {
      error: 'Unauthorized' // Or a more specific error message
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`,
  };

  await kv.hmset(`chat:${chat.id}`, payload);

  return payload;
}
