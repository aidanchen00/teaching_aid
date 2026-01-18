import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import type { DepartmentStatus, AgentStatus } from "@/lib/mock-data";

interface StatusBadgeProps {
  status: DepartmentStatus | AgentStatus;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1"
  };

  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          variant: "success" as const,
          icon: CheckCircle2,
          label: "Completed"
        };
      case "running":
      case "working":
        return {
          variant: "info" as const,
          icon: Loader2,
          label: status === "running" ? "Running" : "Working",
          animate: true
        };
      case "waiting":
      case "queued":
        return {
          variant: "secondary" as const,
          icon: Clock,
          label: status === "waiting" ? "Waiting" : "Queued"
        };
      case "error":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Error"
        };
      case "needs_auth":
        return {
          variant: "warning" as const,
          icon: AlertTriangle,
          label: "Needs Auth"
        };
      default:
        return {
          variant: "default" as const,
          icon: Clock,
          label: "Unknown"
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={sizeClasses[size]}>
      <Icon
        className={`mr-1 h-3 w-3 ${config.animate ? "animate-spin" : ""}`}
      />
      {config.label}
    </Badge>
  );
}
