"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Eye,
  Copy,
  Check,
  Palette,
  Type,
  FileText,
  Share2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface MarketingOutputsPanelProps {
  outputs: Record<string, unknown>;
}

export function MarketingOutputsPanel({ outputs }: MarketingOutputsPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasOutputs = Object.keys(outputs).length > 0;

  if (!hasOutputs) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-medium mb-2">No outputs yet</h3>
          <p className="text-sm text-muted-foreground">
            Run the marketing agents to generate brand assets
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Generated Outputs</h3>
        <p className="text-sm text-muted-foreground">
          Brand assets and marketing materials
        </p>
      </div>

      <Tabs defaultValue="brand" className="flex-1 flex flex-col">
        <div className="px-4 border-b">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="brand" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Brand
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Design
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="social" className="text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Social
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="brand" className="p-4 space-y-4 m-0">
            <BrandOutputs
              brandStrategy={outputs.brandStrategy as Record<string, unknown>}
              copiedId={copiedId}
              onCopy={copyToClipboard}
            />
          </TabsContent>

          <TabsContent value="design" className="p-4 space-y-4 m-0">
            <DesignOutputs
              design={outputs.design as Record<string, unknown>}
              copiedId={copiedId}
              onCopy={copyToClipboard}
            />
          </TabsContent>

          <TabsContent value="content" className="p-4 space-y-4 m-0">
            <ContentOutputs
              content={outputs.content as Record<string, unknown>}
              copiedId={copiedId}
              onCopy={copyToClipboard}
            />
          </TabsContent>

          <TabsContent value="social" className="p-4 space-y-4 m-0">
            <SocialOutputs
              socialMedia={outputs.socialMedia as Record<string, unknown>}
              copiedId={copiedId}
              onCopy={copyToClipboard}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
}

interface OutputSectionProps {
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

function BrandOutputs({
  brandStrategy,
  copiedId,
  onCopy,
}: OutputSectionProps & { brandStrategy?: Record<string, unknown> }) {
  if (!brandStrategy) {
    return (
      <EmptyState message="Brand strategy outputs will appear here" />
    );
  }

  // Extract tool results from the strategy
  const toolCalls = (brandStrategy.toolCalls as Array<{ toolName: string; result: unknown }>) || [];
  
  return (
    <div className="space-y-4">
      {toolCalls.map((tc, index) => (
        <OutputCard
          key={index}
          title={formatToolName(tc.toolName)}
          content={tc.result}
          id={`brand-${index}`}
          copiedId={copiedId}
          onCopy={onCopy}
        />
      ))}
      
      {typeof brandStrategy.text === 'string' && brandStrategy.text && (
        <OutputCard
          title="Strategy Summary"
          content={brandStrategy.text as string}
          id="brand-summary"
          copiedId={copiedId}
          onCopy={onCopy}
        />
      )}
    </div>
  );
}

function DesignOutputs({
  design,
  copiedId,
  onCopy,
}: OutputSectionProps & { design?: Record<string, unknown> }) {
  if (!design) {
    return <EmptyState message="Design outputs will appear here" />;
  }

  const toolCalls = (design.toolCalls as Array<{ toolName: string; result: unknown }>) || [];

  return (
    <div className="space-y-4">
      {toolCalls.map((tc, index) => {
        // Special handling for logo with SVG preview
        if (tc.toolName === "generateLogo" && tc.result) {
          const result = tc.result as { logoConcept?: { svgCode?: string } };
          return (
            <div key={index} className="space-y-2">
              <OutputCard
                title="Logo Concept"
                content={tc.result}
                id={`design-${index}`}
                copiedId={copiedId}
                onCopy={onCopy}
              />
              {result.logoConcept?.svgCode && (
                <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
                  <div
                    className="w-32 h-32"
                    dangerouslySetInnerHTML={{
                      __html: result.logoConcept.svgCode,
                    }}
                  />
                </div>
              )}
            </div>
          );
        }

        // Color palette with swatches
        if (tc.toolName === "generateColorPalette" && tc.result) {
          const result = tc.result as {
            colorPalette?: {
              primary?: { hex: string };
              secondary?: { hex: string };
              accent?: { hex: string };
            };
          };
          return (
            <div key={index} className="space-y-2">
              <h4 className="font-medium">Color Palette</h4>
              {result.colorPalette && (
                <div className="flex gap-2">
                  {result.colorPalette.primary && (
                    <ColorSwatch
                      color={result.colorPalette.primary.hex}
                      label="Primary"
                    />
                  )}
                  {result.colorPalette.secondary && (
                    <ColorSwatch
                      color={result.colorPalette.secondary.hex}
                      label="Secondary"
                    />
                  )}
                  {result.colorPalette.accent && (
                    <ColorSwatch
                      color={result.colorPalette.accent.hex}
                      label="Accent"
                    />
                  )}
                </div>
              )}
              <OutputCard
                title="Full Palette Details"
                content={tc.result}
                id={`design-${index}`}
                copiedId={copiedId}
                onCopy={onCopy}
                collapsed
              />
            </div>
          );
        }

        return (
          <OutputCard
            key={index}
            title={formatToolName(tc.toolName)}
            content={tc.result}
            id={`design-${index}`}
            copiedId={copiedId}
            onCopy={onCopy}
          />
        );
      })}
    </div>
  );
}

function ContentOutputs({
  content,
  copiedId,
  onCopy,
}: OutputSectionProps & { content?: Record<string, unknown> }) {
  if (!content) {
    return <EmptyState message="Content outputs will appear here" />;
  }

  const toolCalls = (content.toolCalls as Array<{ toolName: string; result: unknown }>) || [];

  return (
    <div className="space-y-4">
      {toolCalls.map((tc, index) => (
        <OutputCard
          key={index}
          title={formatToolName(tc.toolName)}
          content={tc.result}
          id={`content-${index}`}
          copiedId={copiedId}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

function SocialOutputs({
  socialMedia,
  copiedId,
  onCopy,
}: OutputSectionProps & { socialMedia?: Record<string, unknown> }) {
  if (!socialMedia) {
    return <EmptyState message="Social media outputs will appear here" />;
  }

  const toolCalls = (socialMedia.toolCalls as Array<{ toolName: string; result: unknown }>) || [];

  return (
    <div className="space-y-4">
      {toolCalls.map((tc, index) => (
        <OutputCard
          key={index}
          title={formatToolName(tc.toolName)}
          content={tc.result}
          id={`social-${index}`}
          copiedId={copiedId}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

interface OutputCardProps {
  title: string;
  content: unknown;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
  collapsed?: boolean;
}

function OutputCard({
  title,
  content,
  id,
  copiedId,
  onCopy,
  collapsed = false,
}: OutputCardProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const contentString =
    typeof content === "string" ? content : JSON.stringify(content, null, 2);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-3 bg-muted/30 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(contentString, id);
            }}
          >
            {copiedId === id ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <pre className="p-3 text-xs overflow-x-auto max-h-64 overflow-y-auto bg-background">
              {contentString}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-12 h-12 rounded-lg border shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs mt-1 text-muted-foreground">{label}</span>
      <code className="text-xs">{color}</code>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">{message}</p>
    </div>
  );
}

function formatToolName(toolName: string): string {
  return toolName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
