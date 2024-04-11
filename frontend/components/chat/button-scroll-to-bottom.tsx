// frontend\components\chat\button-scroll-to-bottom.tsx

/**
 * This is a React component that renders a button to scroll to the bottom of the page.
 * It uses the "use client" directive to indicate it should be rendered on the client-side.
 * The component imports various utility functions and UI components.
 * It also uses a custom hook `useAtBottom` to determine if the user is already at the bottom of the page.
 * The button is conditionally styled based on whether the user is at the bottom or not.
 * When clicked, the button smoothly scrolls the page to the bottom.
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useAtBottom } from "@/lib/hooks/use-at-bottom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { IconArrowDown } from "@/components/ui/icons";

/**
 * ButtonScrollToBottom component
 *
 * @param {ButtonProps} props - The props for the Button component
 * @param {string} [props.className] - Additional class name(s) to apply to the button
 * @returns {JSX.Element} The rendered ButtonScrollToBottom component
 */
export function ButtonScrollToBottom({ className, ...props }: ButtonProps) {
  /**
   * isAtBottom is a boolean state variable that indicates whether the user is currently at the bottom of the page.
   * It is determined using the custom `useAtBottom` hook.
   */
  const isAtBottom = useAtBottom();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "absolute right-4 top-1 z-10 bg-background transition-opacity duration-300 sm:right-8 md:top-2",
        // Conditionally apply opacity based on isAtBottom state
        isAtBottom ? "opacity-0" : "opacity-100",
        // Apply any additional className passed as prop
        className
      )}
      onClick={() =>
        // When the button is clicked, smoothly scroll to the bottom of the page
        window.scrollTo({
          top: document.body.offsetHeight,
          behavior: "smooth",
        })
      }
      {...props}
    >
      {/* Render the down arrow icon */}
      <IconArrowDown />
      {/* Add a visually hidden text for accessibility */}
      <span className="sr-only">Scroll to bottom</span>
    </Button>
  );
}
