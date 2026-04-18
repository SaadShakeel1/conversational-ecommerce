"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";
import type { ChatMessage, ChatResponse } from "@/lib/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>(() => uid());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      setError(null);
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setPending(true);

      try {
        const res: ChatResponse = await api.chat.post({
          message: content,
          session_id: sessionId,
        });

        const assistantMsg: ChatMessage = {
          id: uid(),
          role: "assistant",
          content: res.reply,
          product_ids: res.product_ids,
          follow_up_prompts: res.follow_up_prompts,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Chat failed";
        setError(msg);
      } finally {
        setPending(false);
      }
    },
    [sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(uid());
    setError(null);
  }, []);

  return { messages, pending, error, sendMessage, clearChat };
}
