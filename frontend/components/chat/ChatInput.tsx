"use client";

import { useState, type FormEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 relative">
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask about products, compare items, check inventory..."
          disabled={disabled}
          rows={1}
          className="input-field resize-none min-h-[48px] max-h-32 pr-4"
          aria-label="Chat message input"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="btn-primary !rounded-xl h-12 w-12 !p-0 flex-shrink-0"
        aria-label="Send message"
      >
        {disabled ? (
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-surface-900 rounded-full animate-typing-dot" />
            <span className="w-1.5 h-1.5 bg-surface-900 rounded-full animate-typing-dot [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-surface-900 rounded-full animate-typing-dot [animation-delay:0.4s]" />
          </div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
      </button>
    </form>
  );
}
