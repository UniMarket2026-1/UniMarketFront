"use client";

import { useCallback, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { Message } from "@/lib/types";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

/**
 * Custom hook for chat actions — HU-06
 * Handles sending messages and managing the messages map
 */
export function useChat(chatId: string | null) {
  const { messages, setMessages, chats } = useApp();

  const chatMessages = chatId ? (messages[chatId] ?? []) : [];
  const chat = chats.find((c) => c.id === chatId) ?? null;

  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      try {
        const remoteMessages = await apiClient.getChatMessages(chatId);
        setMessages((prev) => ({
          ...prev,
          [chatId]: Array.isArray(remoteMessages) ? remoteMessages : remoteMessages?.data ?? [],
        }));
      } catch {
        // Preserve local state if the backend request fails.
      }
    };

    void loadMessages();
  }, [chatId, setMessages]);

  const sendMessage = useCallback(
    async (senderId: string, text: string) => {
      if (!chatId || !text.trim()) return;

      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
        if (token) {
          const savedMessage = await apiClient.sendMessage(chatId, text.trim());
          const normalizedMessage: Message = {
            id: savedMessage.id ?? Date.now().toString(),
            chatId,
            senderId: savedMessage.senderId ?? senderId,
            text: savedMessage.text ?? text.trim(),
            timestamp:
              typeof savedMessage.timestamp === "string"
                ? savedMessage.timestamp
                : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          setMessages((prev) => ({
            ...prev,
            [chatId]: [...(prev[chatId] ?? []), normalizedMessage],
          }));
          return;
        }
      } catch {
        // fall through to local optimistic update
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        chatId,
        senderId,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), newMessage],
      }));
    },
    [chatId, setMessages]
  );

  return { chat, chatMessages, sendMessage };
}

/**
 * Custom hook for initiating a new chat from a product — HU-06
 */
export function useStartChat() {
  const { handleStartChat } = useApp();

  const startChat = useCallback(
    (product: import("@/lib/types").Product): string | null => {
      const chatId = handleStartChat(product);
      return chatId;
    },
    [handleStartChat]
  );

  return { startChat };
}
