// frontend\components\header.tsx
import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
// import { auth } from "@/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconVercel,
} from "@/components/ui/icons";
import { UserMenu } from "@/components/user-menu";
import { SidebarMobile } from "@/components/sidebar/sidebar-mobile";
import { SidebarToggle } from "@/components/sidebar/sidebar-toggle";
import { ChatHistory } from "@/components/chat/chat-history";

const defaultUserId = "local-user"; // Define the default user ID

async function UserOrLogin() {
  // const session = await auth();
  return (
    <>
      {/* {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <Link href="/" target="_blank" rel="nofollow">
          <IconNextChat className="size-6 mr-2 dark:hidden" inverted />
          <IconNextChat className="hidden size-6 mr-2 dark:block" />
        </Link>
      )}
      <div className="flex items-center">
        <IconSeparator className="size-6 text-muted-foreground/50" />
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/sign-in?callbackUrl=/">Login</Link>
          </Button>
        )}
      </div> */}
      <SidebarMobile>
        <ChatHistory userId={defaultUserId} /> {/* Use defaultUserId here */}
      </SidebarMobile>
      <SidebarToggle />
      <div className="flex items-center">
        <IconSeparator className="size-6 text-muted-foreground/50" />
        <UserMenu user={{ id: defaultUserId }} /> {/* Use defaultUserId here */}
      </div>
    </>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
        <a
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          target="_blank"
          className={cn(buttonVariants())}
        >
          <IconVercel className="mr-2" />
          <span className="hidden sm:block">Deploy to Vercel</span>
          <span className="sm:hidden">Deploy</span>
        </a>
      </div>
    </header>
  );
}
