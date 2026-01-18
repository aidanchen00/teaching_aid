"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Loader2 } from "lucide-react";
import type { SandboxState } from "@/lib/e2b";

interface SoftwarePreviewProps {
  sandbox: SandboxState;
  refreshKey?: number;
}

export function SoftwarePreview({ sandbox, refreshKey = 0 }: SoftwarePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Live Preview</span>
        <div className="flex items-center gap-1">
          {sandbox.previewUrl && sandbox.status === "ready" && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-7 w-7 p-0"
                title="Refresh"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-7 w-7 p-0"
                title="Open in new tab"
              >
                <a
                  href={sandbox.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Preview Body */}
      <div className="flex-1 bg-white relative">
        {sandbox.status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-4xl mb-3">🚀</div>
              <p className="text-sm text-muted-foreground">
                Your app will appear here
              </p>
            </div>
          </div>
        )}

        {sandbox.status === "creating" && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Starting development sandbox...
              </p>
            </div>
          </div>
        )}

        {sandbox.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center max-w-md px-4">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm text-red-600 font-medium mb-1">
                Sandbox Error
              </p>
              <p className="text-xs text-red-500">{sandbox.error}</p>
            </div>
          </div>
        )}

        {sandbox.status === "ready" && sandbox.previewUrl && (
          <iframe
            ref={iframeRef}
            key={refreshKey}
            src={sandbox.previewUrl}
            title="App Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  );
}
