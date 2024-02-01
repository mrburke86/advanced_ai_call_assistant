// frontend\app\layout.tsx
import { Toaster } from "react-hot-toast";
import { Inter as FontSans } from "next/font/google";

import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";

export const metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: {
    default: "Next.js AI Chatbot",
    template: `%s - Next.js AI Chatbot`,
  },
  description: "An AI-powered chatbot template built with Next.js and Vercel.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", fontSans.variable)}>
        <Toaster />
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
          </div>
          <TailwindIndicator />
        </Providers>
      </body>
    </html>
  );
}
