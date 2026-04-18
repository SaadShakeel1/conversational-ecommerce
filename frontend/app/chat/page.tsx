import type { Metadata } from "next";
import ChatWindow from "@/components/chat/ChatWindow";

export const metadata: Metadata = {
  title: "Chat with AI",
  description: "Chat with our AI shopping assistant to search, compare, and buy products using natural language.",
};

export default function ChatPage() {
  return (
    <div className="section-container py-4 sm:py-6">
      <div className="glass-card overflow-hidden" style={{ height: "calc(100vh - 160px)" }}>
        <ChatWindow />
      </div>
    </div>
  );
}
