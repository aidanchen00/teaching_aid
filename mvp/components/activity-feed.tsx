"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pause, Play } from "lucide-react";
import type { Activity } from "@/lib/mock-data";

interface ActivityFeedProps {
  activities: Activity[];
  maxHeight?: string;
}

export function ActivityFeed({ activities, maxHeight = "300px" }: ActivityFeedProps) {
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPaused && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activities, isPaused]);

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold flex items-center gap-2">
          📡 ACTIVITY FEED
          <Badge variant="secondary" className="ml-2">
            {activities.length} events
          </Badge>
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? (
            <>
              <Play className="h-3 w-3 mr-2" />
              Resume
            </>
          ) : (
            <>
              <Pause className="h-3 w-3 mr-2" />
              Pause
            </>
          )}
        </Button>
      </div>
      <div
        ref={containerRef}
        className="overflow-y-auto p-4 space-y-2 font-mono text-sm"
        style={{ maxHeight }}
      >
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${getActivityColor(
              activity.type
            )}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{getActivityIcon(activity.type)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold opacity-70">
                    {activity.timestamp}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{
                      borderColor: activity.departmentId.includes("business")
                        ? "#3B82F6"
                        : activity.departmentId.includes("engineering")
                        ? "#8B5CF6"
                        : activity.departmentId.includes("marketing")
                        ? "#EC4899"
                        : activity.departmentId.includes("sales")
                        ? "#10B981"
                        : "#F59E0B"
                    }}
                  >
                    {activity.departmentName}
                  </Badge>
                  {activity.agentName && (
                    <span className="text-xs opacity-70">
                      • {activity.agentName}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium">{activity.message}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </Card>
  );
}
