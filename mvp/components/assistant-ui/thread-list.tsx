import { Button } from "@/components/ui/button";
import { useAssistantRuntime } from "@assistant-ui/react";
import { PlusIcon, MessageSquare } from "lucide-react";
import { FC, useEffect, useState } from "react";

interface ThreadData {
  id: string;
  title?: string;
  is_archived?: boolean;
}

export const ThreadList: FC = () => {
  const runtime = useAssistantRuntime();
  const [threads, setThreads] = useState<ThreadData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch threads directly from API
  useEffect(() => {
    fetch("/api/threads")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setThreads(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleThreadClick = (threadId: string) => {
    runtime.switchToThread(threadId);
  };

  const handleNewThread = () => {
    runtime.switchToNewThread();
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="outline"
        className="h-9 justify-start gap-2 rounded-lg px-3 text-sm hover:bg-muted"
        onClick={handleNewThread}
      >
        <PlusIcon className="size-4" />
        New Thread
      </Button>

      {loading ? (
        <div className="px-3 py-2 text-xs text-muted-foreground">Loading...</div>
      ) : threads.length === 0 ? (
        <div className="px-3 py-2 text-xs text-muted-foreground">No threads yet</div>
      ) : (
        threads.map((thread) => (
          <button
            key={thread.id}
            onClick={() => handleThreadClick(thread.id)}
            className="flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{thread.title || "New Chat"}</span>
          </button>
        ))
      )}
    </div>
  );
};
