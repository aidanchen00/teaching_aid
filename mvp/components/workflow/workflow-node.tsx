"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  XCircle,
  Target,
  Code,
  Megaphone,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, any> = {
  target: Target,
  code: Code,
  megaphone: Megaphone,
  'trending-up': TrendingUp,
  briefcase: Briefcase,
};

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-card',
    borderColor: 'border-border',
    animate: false
  },
  running: {
    icon: Loader2,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/50',
    animate: true
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50',
    animate: false
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    animate: false
  },
  needs_auth: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/50',
    animate: false
  }
};

export const WorkflowNode = memo(({ data }: NodeProps) => {
  const Icon = iconMap[data.icon as string] || Target;
  const config = statusConfig[data.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  // Cast data properties for TypeScript
  const nodeData = data as any;

  return (
    <div className="workflow-node">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      <Card
        className={cn(
          "min-w-[200px] transition-all hover:shadow-lg border-2",
          config.borderColor
        )}
      >
        <div className={cn("p-3", config.bgColor)}>
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="p-1.5 rounded"
              style={{ backgroundColor: `${nodeData.color}20` }}
            >
              <Icon className="h-4 w-4" style={{ color: nodeData.color as string }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate">{nodeData.label}</div>
            </div>
            <StatusIcon
              className={cn(
                "h-4 w-4",
                config.color,
                config.animate && "animate-spin"
              )}
            />
          </div>

          {/* Description */}
          {nodeData.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {nodeData.description as string}
            </p>
          )}

          {/* Progress */}
          {nodeData.progress !== undefined && nodeData.status === 'running' && (
            <div className="mb-2">
              <Progress value={nodeData.progress as number} className="h-1.5" />
              <div className="text-xs text-gray-600 mt-1">
                {nodeData.progress}% complete
              </div>
            </div>
          )}

          {/* Tools */}
          {nodeData.tools && Array.isArray(nodeData.tools) && nodeData.tools.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {(nodeData.tools as string[]).map((tool: string) => (
                <Badge key={tool} variant="secondary" className="text-xs px-1.5 py-0">
                  {tool}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
