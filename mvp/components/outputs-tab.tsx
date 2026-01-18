"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Eye,
  ExternalLink,
  FileText,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Clock,
  Filter
} from "lucide-react";
import type { Project, Output } from "@/lib/mock-data";

interface OutputsTabProps {
  project: Project;
}

const outputIcons: Record<Output["type"], any> = {
  pdf: FileText,
  markdown: FileText,
  link: LinkIcon,
  code: Code,
  sheet: FileText,
  design: ImageIcon
};

export function OutputsTab({ project }: OutputsTabProps) {
  const [filter, setFilter] = useState<"all" | string>("all");

  const allOutputs = project.departments.flatMap(dept =>
    dept.outputs.map(output => ({ ...output, department: dept }))
  );

  const filteredOutputs =
    filter === "all"
      ? allOutputs
      : allOutputs.filter(o => o.department.id === filter);

  const readyOutputs = allOutputs.filter(o => o.status === "ready");
  const inProgressOutputs = allOutputs.filter(o => o.status === "in_progress");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="text-3xl font-bold">{allOutputs.length}</div>
          <div className="text-sm text-muted-foreground">Total Outputs</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-green-600">
            {readyOutputs.length}
          </div>
          <div className="text-sm text-muted-foreground">Ready to Download</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold text-blue-600">
            {inProgressOutputs.length}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Departments
          </Button>
          {project.departments.map(dept => (
            <Button
              key={dept.id}
              size="sm"
              variant={filter === dept.id ? "default" : "outline"}
              onClick={() => setFilter(dept.id)}
            >
              {dept.name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Bulk Actions */}
      {readyOutputs.length > 0 && (
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All ({readyOutputs.length})
          </Button>
          <Button variant="outline">
            <ExternalLink className="mr-2 h-4 w-4" />
            Share Project
          </Button>
        </div>
      )}

      {/* Outputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOutputs.length === 0 ? (
          <Card className="p-12 col-span-full text-center">
            <p className="text-muted-foreground">No outputs yet</p>
          </Card>
        ) : (
          filteredOutputs.map(output => {
            const OutputIcon = outputIcons[output.type];
            return (
              <Card key={output.id} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        output.status === "ready"
                          ? "bg-green-100"
                          : output.status === "in_progress"
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <OutputIcon
                        className={`h-6 w-6 ${
                          output.status === "ready"
                            ? "text-green-600"
                            : output.status === "in_progress"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{output.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: output.department.color,
                            color: output.department.color
                          }}
                        >
                          {output.department.name}
                        </Badge>
                        {output.size && <span>• {output.size}</span>}
                        <span>• {output.type.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created {output.createdAt} by {output.createdBy}
                      </p>
                      {output.storedIn && (
                        <p className="text-xs text-muted-foreground mt-1">
                          📍 Stored in {output.storedIn}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {output.status === "ready" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    {output.status === "in_progress" && (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    )}
                    {output.status === "pending" && (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {output.status === "in_progress" && output.progress && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{output.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${output.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {output.status === "ready" && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="mr-2 h-3 w-3" />
                      Preview
                    </Button>
                    {output.url && (
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href={output.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {output.status === "pending" && (
                  <p className="text-sm text-gray-500">Waiting to start...</p>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
