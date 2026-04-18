"use client";

import Link from "next/link";
import type { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onFollowUp?: (prompt: string) => void;
}

export default function MessageBubble({ message, onFollowUp }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-up`}
    >
      <div className={`max-w-[85%] sm:max-w-[70%]`}>
        {/* Avatar + Name */}
        <div className={`flex items-center gap-2 mb-1 ${isUser ? "flex-row-reverse" : ""}`}>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isUser
                ? "bg-brand-500 text-surface-900"
                : "bg-surface-600 text-neon-green border border-neon-green/30"
            }`}
          >
            {isUser ? "U" : "AI"}
          </div>
          <span className="text-xs text-gray-500">
            {isUser ? "You" : "ConvoShop AI"}
          </span>
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-md"
              : "glass-card text-gray-200 rounded-tl-md"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Product Links */}
        {!isUser && message.product_ids && message.product_ids.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.product_ids.map((pid) => (
              <Link
                key={pid}
                href={`/products/${pid}`}
                className="badge hover:bg-neon-green/20 transition-colors cursor-pointer"
              >
                Product #{pid} →
              </Link>
            ))}
          </div>
        )}

        {/* Follow-up Prompts */}
        {!isUser &&
          message.follow_up_prompts &&
          message.follow_up_prompts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.follow_up_prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUp?.(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-surface-400/40 text-gray-300
                    hover:border-neon-green/40 hover:text-neon-green hover:bg-neon-green/5
                    transition-all duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-600 mt-1 ${isUser ? "text-right" : ""}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
