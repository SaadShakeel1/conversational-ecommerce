"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

const SUGGESTIONS = [
  "Show me wireless headphones under $100",
  "Compare the top 3 laptops",
  "What's in stock for running shoes?",
  "Find me a gift under $50",
];

export default function ChatWindow() {
  const { messages, pending, error, sendMessage, clearChat } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-500/30">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse" />
          <div>
            <h2 className="text-sm font-semibold text-white">ConvoShop AI</h2>
            <p className="text-xs text-gray-500">Always ready to help</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="btn-ghost text-xs"
          title="Clear chat"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-neon-green/20 flex items-center justify-center mb-6 border border-neon-green/20">
              <span className="text-3xl">🛒</span>
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-2">
              How can I help you shop?
            </h3>
            <p className="text-gray-500 text-sm mb-8 max-w-md">
              I can search products, compare items, check stock, manage your cart,
              and answer questions — all in natural language.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-surface-400/30 text-gray-400
                    hover:border-neon-green/30 hover:text-neon-green hover:bg-neon-green/5
                    transition-all duration-200"
                >
                  &ldquo;{s}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onFollowUp={(prompt) => sendMessage(prompt)}
            />
          ))
        )}

        {/* Typing indicator */}
        {pending && (
          <div className="flex items-center gap-2 text-gray-500 text-sm animate-fade-in">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-neon-green/60 rounded-full animate-typing-dot" />
              <span className="w-2 h-2 bg-neon-green/60 rounded-full animate-typing-dot [animation-delay:0.2s]" />
              <span className="w-2 h-2 bg-neon-green/60 rounded-full animate-typing-dot [animation-delay:0.4s]" />
            </div>
            AI is thinking...
          </div>
        )}

        {error && (
          <div className="glass-card border-red-500/30 p-3 text-red-400 text-sm animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-surface-500/30 p-4 bg-surface-900/50 backdrop-blur-lg">
        <ChatInput onSend={sendMessage} disabled={pending} />
      </div>
    </div>
  );
}
