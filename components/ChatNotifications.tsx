"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { ChatMessage } from "@/server/types"
import { usePathname } from "next/navigation"

export function ChatNotifications() {
  const pathname = usePathname()
  const lastMessageIdRef = useRef<string | null>(null)

  const handleNewMessage = (message: ChatMessage) => {
    // Only show notifications on the landing page
    if (pathname !== '/') return;

    // Skip if we've already shown this message
    if (lastMessageIdRef.current === message.id) {
      return;
    }
    
    // Update last shown message ID
    lastMessageIdRef.current = message.id;
    
    // Dismiss any existing toasts
    toast.dismiss();
    
    const truncatedContent = message.content.length > 57 
      ? `${message.content.substring(0, 57)}...` 
      : message.content

    toast(
      <div className="w-full space-y-1">
        <div className="font-medium">{message.sender?.username || 'Unknown'}</div>
        <div className="text-muted-foreground break-words">{truncatedContent}</div>
      </div>,
      {
        position: "bottom-right",
        duration: 6000,
      }
    )
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Message event received:", event.data);
      if (event.data?.type === "newMessage") {
        handleNewMessage(event.data.message)
      }
    }

    // Only add listener on landing page
    if (pathname === '/') {
      console.log("Adding message event listener");
      window.addEventListener("message", handleMessage)
      return () => {
        console.log("Removing message event listener");
        window.removeEventListener("message", handleMessage)
      }
    }
  }, [pathname])

  return null
}
