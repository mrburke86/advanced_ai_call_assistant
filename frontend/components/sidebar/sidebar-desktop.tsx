// frontend\components\sidebar\sidebar-desktop.tsx
import { Sidebar } from "@/components/sidebar/sidebar";

// import { auth } from "@/auth";
import { ChatHistory } from "@/components/chat/chat-history";

const defaultUserId = "local-user"; // Define the default user ID

export async function SidebarDesktop() {
  // const session = await auth();

  // if (!session?.user?.id) {
  //   return null;
  // }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      {/* <ChatHistory userId={session.user.id} /> */}
      <ChatHistory userId={defaultUserId} />
    </Sidebar>
  );
}
