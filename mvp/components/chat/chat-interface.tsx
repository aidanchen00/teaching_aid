"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ChatMessage } from "./chat-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  disabled = false
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading || disabled) return;
    onSendMessage(input.trim());
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <h3 className="text-lg font-semibold mb-2">
                Welcome to Openpreneurship
              </h3>
              <p className="text-sm text-muted-foreground">
                Describe what you want to build, and I'll orchestrate AI departments
                to make it happen.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <Card className="p-4 bg-gray-50 border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - suppressHydrationWarning to handle browser extension injections */}
      <div className="border-t bg-card p-4" suppressHydrationWarning>
        <div className="flex gap-2 items-end" suppressHydrationWarning>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="min-h-[60px] max-h-[200px] resize-none"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || disabled}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Press <kbd className="px-1.5 py-0.5 rounded bg-secondary border">Enter</kbd> to send,{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-secondary border">Shift+Enter</kbd> for new line
        </div>
      </div>
    </div>
  );
}
