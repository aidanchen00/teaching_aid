"use client";

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Loader2,
  Clock,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusIcons = {
  pending: { icon: Clock, color: 'text-gray-400', animate: false },
  running: { icon: Loader2, color: 'text-blue-500', animate: true },
  completed: { icon: CheckCircle2, color: 'text-green-500', animate: false },
  error: { icon: XCircle, color: 'text-red-500', animate: false },
  needs_auth: { icon: AlertTriangle, color: 'text-yellow-500', animate: false }
};

export const AgentNode = memo(({ data }: NodeProps) => {
  const nodeData = data as any;
  const statusConfig = statusIcons[nodeData.status as keyof typeof statusIcons] || statusIcons.pending;
  const StatusIcon = statusConfig.icon;

  // Use the department color from the node data
  const departmentColor = nodeData.color || '#6B7280';

  return (
    <div className="agent-node">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-2 !h-2"
      />

      <div
        className="relative w-32 h-32 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer flex flex-col items-center justify-center p-3"
        style={{
          backgroundColor: `${departmentColor}15`,
          borderColor: departmentColor
        }}
      >
        {/* Emoji Icon with department color background */}
        <div
          className="text-3xl mb-2 p-2 rounded-full"
          style={{ backgroundColor: `${departmentColor}25` }}
        >
          🤖
        </div>

        {/* Agent Name */}
        <div className="text-xs font-semibold text-center leading-tight mb-1">
          {nodeData.label}
        </div>

        {/* Status Indicator */}
        <div className="absolute top-1 right-1">
          <StatusIcon
            className={cn(
              "h-3 w-3",
              statusConfig.color,
              statusConfig.animate && "animate-spin"
            )}
          />
        </div>

        {/* Progress Bar - only show during running status */}
        {nodeData.progress !== undefined && nodeData.status === 'running' && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${nodeData.progress}%`,
                  backgroundColor: departmentColor
                }}
              />
            </div>
          </div>
        )}

        {/* Tools Badge - only show when not running (no progress bar) */}
        {nodeData.tools && nodeData.tools.length > 0 && nodeData.status !== 'running' && (
          <div className="absolute bottom-1 left-1 right-1 flex justify-center">
            <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3">
              {nodeData.tools.length} tools
            </Badge>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-2 !h-2"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
