"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SessionSummary {
  id: string;
  name: string;
  departmentId: string;
  status: "draft" | "running" | "completed" | "error";
  createdAt: string;
  updatedAt: string;
}

interface SessionSidebarProps {
  departmentId: string;
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export function SessionSidebar({
  departmentId,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [departmentId]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sessions?departmentId=${departmentId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        onDeleteSession(sessionId);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const statusIcon = {
    draft: <FileText className="h-4 w-4 text-gray-400" />,
    running: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />,
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const statusColor = {
    draft: "bg-gray-100 text-gray-700",
    running: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className="w-64 border-r flex flex-col bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Sessions</h3>
        <Button size="sm" variant="ghost" onClick={onNewSession}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Session List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sessions yet</p>
              <Button
                variant="link"
                size="sm"
                onClick={onNewSession}
                className="mt-2"
              >
                Create your first session
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      activeSessionId === session.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex items-start gap-2">
                      {statusIcon[session.status]}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {session.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${statusColor[session.status]}`}
                          >
                            {session.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(session.updatedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => handleDelete(e, session.id)}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* New Session Button */}
      <div className="p-3 border-t">
        <Button className="w-full" onClick={onNewSession}>
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>
    </div>
  );
}
