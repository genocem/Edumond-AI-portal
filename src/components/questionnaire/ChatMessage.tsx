"use client";

import { motion } from "framer-motion";

interface ChatMessageProps {
  type: "assistant" | "user";
  children: React.ReactNode;
  delay?: number;
}

export function ChatMessage({ type, children, delay = 0 }: ChatMessageProps) {
  return (
    <motion.div
      className={`flex ${type === "user" ? "justify-end" : "justify-start"} mb-4`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-3 ${
          type === "assistant"
            ? "bg-card border border-border text-card-foreground rounded-bl-sm"
            : "bg-accent text-white rounded-br-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
