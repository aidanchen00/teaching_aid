"use client";

import { ChatMessage as ChatMessageType } from "@/lib/types";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser && "flex-row-reverse",
        isSystem && "justify-center"
      )}
    >
      {!isSystem && (
        <Avatar className={cn(
          "h-8 w-8 flex items-center justify-center",
          isUser ? "bg-blue-500" : "bg-purple-500"
        )}>
          {isUser ? (
            <User className="h-4 w-4 text-white" />
          ) : (
            <Sparkles className="h-4 w-4 text-white" />
          )}
        </Avatar>
      )}

      <div className={cn("flex-1 max-w-[80%]", isUser && "flex justify-end")}>
        {isSystem ? (
          <div className="text-xs text-muted-foreground text-center py-2">
            {message.content}
          </div>
        ) : (
          <Card
            className={cn(
              "p-4",
              isUser
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-gray-50 border-gray-200"
            )}
          >
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            <div
              className={cn(
                "text-xs mt-2 opacity-70",
                isUser ? "text-blue-100" : "text-gray-500"
              )}
            >
              {message.timestamp.toLocaleTimeString()}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
