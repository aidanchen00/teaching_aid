"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExecutionOutput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  FileText,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Download,
  Code,
  Eye,
  Palette,
  Type,
  Globe,
  Smartphone,
  Monitor,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Instagram,
  Twitter,
  Linkedin,
  Facebook
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// FIGMA-LIKE DEVICE MOCKUP COMPONENTS
// ============================================

// Browser Frame Component
function BrowserFrame({ children, url = "yoursite.com" }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white shadow-2xl overflow-hidden">
      {/* Browser Chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-md px-4 py-1 text-xs text-gray-500 border flex items-center gap-2 min-w-[200px]">
            <Globe className="h-3 w-3" />
            {url}
          </div>
        </div>
        <div className="w-16" />
      </div>
      {/* Browser Content */}
      <div className="bg-white">
        {children}
      </div>
    </div>
  );
}

// Phone Frame Component
function PhoneFrame({ children, platform = "instagram" }: { children: React.ReactNode; platform?: string }) {
  return (
    <div className="w-[320px] mx-auto">
      <div className="rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-800 shadow-2xl overflow-hidden">
        {/* Phone Notch */}
        <div className="bg-gray-800 h-6 flex justify-center items-end pb-1">
          <div className="w-20 h-4 bg-black rounded-full" />
        </div>
        {/* Phone Screen */}
        <div className="bg-white">
          {children}
        </div>
        {/* Home Indicator */}
        <div className="bg-gray-800 h-4 flex justify-center items-center">
          <div className="w-24 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Social Post Mockup
function SocialPostMockup({ 
  platform, 
  content, 
  hashtags,
  brandName = "YourBrand"
}: { 
  platform: string; 
  content: string; 
  hashtags?: string[];
  brandName?: string;
}) {
  const PlatformIcon = platform === 'instagram' ? Instagram 
    : platform === 'twitter' ? Twitter 
    : platform === 'linkedin' ? Linkedin 
    : Facebook;

  if (platform === 'instagram') {
    return (
      <PhoneFrame platform="instagram">
        <div className="bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <span className="font-semibold text-sm">{brandName}</span>
            </div>
            <MoreHorizontal className="h-5 w-5" />
          </div>
          {/* Image Placeholder */}
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Image</span>
          </div>
          {/* Actions */}
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="h-6 w-6" />
              <MessageCircle className="h-6 w-6" />
              <Share2 className="h-6 w-6" />
            </div>
            <Bookmark className="h-6 w-6" />
          </div>
          {/* Caption */}
          <div className="px-3 pb-3 text-sm">
            <span className="font-semibold">{brandName}</span>{' '}
            <span className="whitespace-pre-wrap">{content}</span>
            {hashtags && (
              <span className="text-blue-500 block mt-1">
                {hashtags.map(h => `#${h}`).join(' ')}
              </span>
            )}
          </div>
        </div>
      </PhoneFrame>
    );
  }

  // Generic post card for other platforms
  return (
    <div className="border rounded-xl p-4 bg-white shadow-lg max-w-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <PlatformIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">{brandName}</p>
          <p className="text-xs text-gray-500">@{brandName.toLowerCase()}</p>
        </div>
      </div>
      <p className="text-sm mb-2 whitespace-pre-wrap">{content}</p>
      {hashtags && (
        <p className="text-sm text-blue-500">
          {hashtags.map(h => `#${h}`).join(' ')}
        </p>
      )}
    </div>
  );
}

// Color Swatch Card (Figma-style)
function ColorSwatchCard({ name, hex, usage }: { name: string; hex: string; usage?: string }) {
  const isLight = hex ? parseInt(hex.replace('#', ''), 16) > 0xffffff / 2 : true;
  
  return (
    <div className="rounded-xl overflow-hidden shadow-lg border">
      <div 
        className="h-24 flex items-end p-3"
        style={{ backgroundColor: hex || '#ccc' }}
      >
        <span className={cn(
          "font-mono text-xs px-2 py-1 rounded",
          isLight ? "bg-black/10 text-black" : "bg-white/20 text-white"
        )}>
          {hex}
        </span>
      </div>
      <div className="p-3 bg-white">
        <p className="font-semibold capitalize text-sm">{name}</p>
        {usage && <p className="text-xs text-muted-foreground mt-1">{usage}</p>}
      </div>
    </div>
  );
}

// Typography Specimen (Figma-style)
function TypographySpecimen({ 
  name, 
  fontFamily, 
  weights,
  usage 
}: { 
  name: string; 
  fontFamily: string; 
  weights?: string[];
  usage?: string;
}) {
  return (
    <div className="rounded-xl border overflow-hidden shadow-lg">
      <div className="p-6 bg-white">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">{name}</p>
        <p className="text-4xl mb-2" style={{ fontFamily }}>
          Aa Bb Cc
        </p>
        <p className="text-lg text-muted-foreground" style={{ fontFamily }}>
          The quick brown fox jumps over the lazy dog
        </p>
      </div>
      <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between">
        <code className="text-xs bg-gray-200 px-2 py-1 rounded">{fontFamily}</code>
        {weights && (
          <span className="text-xs text-muted-foreground">
            {weights.join(' • ')}
          </span>
        )}
      </div>
    </div>
  );
}

interface OutputPreviewModalProps {
  output: ExecutionOutput;
  onClose: () => void;
}

// Format the actual output data for display
const formatOutputData = (data: unknown): string => {
  if (!data) return "No data available";
  if (typeof data === "string") return data;
  return JSON.stringify(data, null, 2);
};

// Extract and normalize SVG to ensure it renders properly
const normalizeSvg = (svgCode: string, width: string, height: string): string => {
  if (!svgCode) return '';

  // Clean up the input - remove markdown code blocks
  let cleaned = svgCode
    .replace(/```svg\n?/gi, '')
    .replace(/```xml\n?/gi, '')
    .replace(/```html\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim();

  // Extract only the SVG element - the AI often includes description text with the SVG
  // Use a more robust regex that handles multiline and various SVG formats
  const svgMatch = cleaned.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);

  if (!svgMatch) {
    // Try to find just an opening svg tag (might be self-closing or malformed)
    const partialMatch = cleaned.match(/<svg[^>]*\/?>/i);
    if (partialMatch) {
      console.warn('Found partial SVG tag but no closing tag:', partialMatch[0].substring(0, 100));
    }

    // No valid SVG found
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-size="12">No valid SVG</text>
    </svg>`;
  }

  let normalized = svgMatch[0];

  // Remove any existing width/height to replace with our own
  normalized = normalized.replace(/\s+width="[^"]*"/gi, '');
  normalized = normalized.replace(/\s+height="[^"]*"/gi, '');

  // Add our width and height
  normalized = normalized.replace('<svg', `<svg width="${width}" height="${height}"`);

  // Add viewBox if missing (common cause of SVGs not rendering)
  if (!normalized.toLowerCase().includes('viewbox')) {
    normalized = normalized.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
  }

  // Add xmlns if missing
  if (!normalized.includes('xmlns')) {
    normalized = normalized.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return normalized;
};

// Download output as JSON file
const downloadOutput = (output: ExecutionOutput) => {
  const data = output.data || {};
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${output.name.replace(/\s+/g, "_").toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export function OutputPreviewModal({ output, onClose }: OutputPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");

  const data = output.data as Record<string, unknown> | undefined;
  const formattedData = formatOutputData(data);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadOutput(output);
  };

  // Render color swatches if this is a color palette output
  const renderColorPalette = () => {
    if (!data?.colorPalette) return null;
    const palette = data.colorPalette as Record<string, { hex?: string; name?: string; usage?: string }>;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color Palette
          </h3>
          <Badge variant="outline" className="text-xs">Figma Ready</Badge>
        </div>
        
        {/* Figma-style color grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(palette).map(([key, color]) => (
            <ColorSwatchCard 
              key={key} 
              name={key} 
              hex={color.hex || '#cccccc'} 
              usage={color.usage} 
            />
          ))}
        </div>
        
        {/* CSS Variables Preview */}
        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
          <p className="text-xs text-gray-400 mb-2 font-mono">/* CSS Variables */</p>
          <pre className="text-xs text-green-400 font-mono">
{`:root {
${Object.entries(palette).map(([key, color]) => `  --color-${key}: ${color.hex || '#ccc'};`).join('\n')}
}`}
          </pre>
        </div>
      </div>
    );
  };

  // Render typography if this is a typography output
  const renderTypography = () => {
    if (!data?.typographySystem) return null;
    const typo = data.typographySystem as Record<string, { fontFamily?: string; weights?: string[]; usage?: string }>;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography System
          </h3>
          <Badge variant="outline" className="text-xs">Type Scale</Badge>
        </div>
        
        {/* Typography Specimens */}
        <div className="space-y-4">
          {Object.entries(typo).map(([key, font]) => (
            <TypographySpecimen
              key={key}
              name={key}
              fontFamily={font.fontFamily || 'system-ui'}
              weights={font.weights}
              usage={font.usage}
            />
          ))}
        </div>
      </div>
    );
  };

  // Render logo SVG if available
  const renderLogo = () => {
    if (!data?.logoConcept) return null;
    const logo = data.logoConcept as { 
      svgCode?: string; 
      concept?: string; 
      colorScheme?: string;
      name?: string;
      style?: string;
      symbolism?: string;
      variations?: Array<{ name?: string; usage?: string }>;
    };
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Logo Concept
          </h3>
          {logo.svgCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Extract clean SVG for download
                const cleanSvg = normalizeSvg(logo.svgCode || '', '200', '60');
                const blob = new Blob([cleanSvg], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${logo.name || 'logo'}.svg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download SVG
            </Button>
          )}
        </div>

        {logo.name && (
          <div className="p-4 bg-muted/20 rounded-lg border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Logo Name</p>
            <p className="font-bold text-lg">{logo.name}</p>
          </div>
        )}

        {logo.concept && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Concept</p>
            <p className="text-muted-foreground leading-relaxed">{logo.concept}</p>
          </div>
        )}

        {/* SVG Preview with multiple backgrounds */}
        {logo.svgCode && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Preview</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Light background */}
              <div className="relative group">
                <div className="p-8 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center shadow-sm min-h-[160px]">
                  <div
                    className="w-32 h-32 flex items-center justify-center"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: normalizeSvg(logo.svgCode, '128', '128') 
                    }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">Light Background</p>
              </div>
              {/* Dark background */}
              <div className="relative group">
                <div className="p-8 bg-gray-900 rounded-xl border-2 border-gray-700 flex items-center justify-center shadow-sm min-h-[160px]">
                  <div
                    className="w-32 h-32 flex items-center justify-center"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: normalizeSvg(logo.svgCode, '128', '128') 
                    }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">Dark Background</p>
              </div>
              {/* Colored background */}
              <div className="relative group">
                <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm min-h-[160px]">
                  <div
                    className="w-32 h-32 flex items-center justify-center"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: normalizeSvg(logo.svgCode, '128', '128') 
                    }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">Gradient Background</p>
              </div>
            </div>
          </div>
        )}

        {/* Additional details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logo.style && (
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Style</p>
              <p className="font-medium">{logo.style}</p>
            </div>
          )}
          {logo.colorScheme && (
            <div className="p-4 bg-muted/20 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Color Scheme</p>
              <p className="font-medium">{logo.colorScheme}</p>
            </div>
          )}
        </div>

        {logo.symbolism && (
          <div className="p-4 bg-muted/20 rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Symbolism</p>
            <p className="text-muted-foreground">{logo.symbolism}</p>
          </div>
        )}

        {logo.variations && Array.isArray(logo.variations) && logo.variations.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Logo Variations</p>
            <div className="grid gap-2">
              {logo.variations.map((v, i) => (
                <div key={i} className="p-3 bg-muted/20 rounded-lg flex items-center gap-3">
                  <Badge variant="outline">{v.name || `Variation ${i + 1}`}</Badge>
                  {v.usage && <span className="text-sm text-muted-foreground">{v.usage}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SVG Code Preview */}
        {logo.svgCode && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">SVG Code</p>
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                {logo.svgCode.length > 500 ? `${logo.svgCode.substring(0, 500)}...` : logo.svgCode}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render brand identity
  const renderBrandIdentity = () => {
    if (!data?.brandIdentity) return null;
    const brand = data.brandIdentity as Record<string, unknown>;
    const personality = brand.personality as { traits?: string[]; tone?: string; voice?: string } | string | undefined;
    const positioning = brand.positioning as { statement?: string; uniqueValueProposition?: string; differentiators?: string[] } | undefined;
    
    return (
      <div className="space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Brand Identity
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {brand.mission != null && (
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mission</p>
                <p className="font-medium">{String(brand.mission)}</p>
              </div>
            )}
            
            {brand.vision != null && (
              <div className="p-4 bg-muted/20 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Vision</p>
                <p className="font-medium">{String(brand.vision)}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {Array.isArray(brand.values) && brand.values.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Core Values</p>
                <div className="flex flex-wrap gap-2">
                  {(brand.values as string[]).map((value, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">{value}</Badge>
                  ))}
                </div>
              </div>
            )}

            {personality && typeof personality === 'object' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Personality</p>
                {personality.tone && <p className="text-sm"><span className="font-semibold">Tone:</span> {personality.tone}</p>}
                {personality.voice && <p className="text-sm"><span className="font-semibold">Voice:</span> {personality.voice}</p>}
                {Array.isArray(personality.traits) && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {personality.traits.map((trait, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{trait}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {positioning && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold">Positioning</h4>
            {positioning.statement && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Statement</p>
                <p className="text-sm italic">"{positioning.statement}"</p>
              </div>
            )}
            {positioning.uniqueValueProposition && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">USP</p>
                <p className="text-sm">{positioning.uniqueValueProposition}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render messaging framework
  const renderMessaging = () => {
    if (!data?.messagingFramework) return null;
    const msg = data.messagingFramework as Record<string, unknown>;
    const keyMessages = msg.keyMessages as Array<{ audience: string; message: string; proofPoints?: string[] } | string> | undefined;
    
    return (
      <div className="space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Messaging Framework
        </h3>
        
        <div className="space-y-4">
          {!!msg.valueProposition && (
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Value Proposition</p>
              <p className="text-lg font-medium leading-relaxed">{String(msg.valueProposition)}</p>
            </div>
          )}
          
          {!!msg.elevatorPitch && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Elevator Pitch</p>
              <p className="italic text-muted-foreground">"{String(msg.elevatorPitch)}"</p>
            </div>
          )}

          {Array.isArray(keyMessages) && keyMessages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Key Messages</h4>
              <div className="grid gap-3">
                {keyMessages.map((item, i) => {
                  if (typeof item === 'string') {
                    return (
                      <div key={i} className="flex items-start gap-2 p-3 bg-white dark:bg-gray-900 rounded border">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </div>
                    );
                  }
                  // Safely render audience and message as strings
                  const audienceText = typeof item.audience === 'string' ? item.audience : JSON.stringify(item.audience);
                  const messageText = typeof item.message === 'string' ? item.message : JSON.stringify(item.message);
                  
                  return (
                    <div key={i} className="p-4 bg-white dark:bg-gray-900 rounded-lg border space-y-2">
                      <Badge variant="outline">{audienceText}</Badge>
                      <p className="font-medium">{messageText}</p>
                      {Array.isArray(item.proofPoints) && (
                        <ul className="list-disc list-inside text-xs text-muted-foreground pl-2">
                          {item.proofPoints.map((pp, j) => (
                            <li key={j}>{typeof pp === 'string' ? pp : JSON.stringify(pp)}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render taglines
  const renderTaglines = () => {
    if (!data?.taglines || !Array.isArray(data.taglines)) return null;
    const taglines = data.taglines as Array<{ tagline: string; rationale?: string; useCase?: string } | string>;
    if (taglines.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="font-semibold">Taglines</h3>
        <div className="space-y-2">
          {taglines.map((item, i) => {
            const taglineText = typeof item === 'string' ? item : item.tagline;
            const rationale = typeof item === 'object' ? item.rationale : null;
            
            return (
              <div key={i} className={cn(
                "p-3 border rounded-lg",
                i === 0 && "bg-primary/5 border-primary/20"
              )}>
                <p className={cn("italic", i === 0 && "font-medium text-lg")}>
                  "{taglineText}"
                </p>
                {rationale && <p className="text-xs text-muted-foreground mt-1">{rationale}</p>}
                {i === 0 && <Badge className="mt-2" variant="secondary">Primary</Badge>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render social posts with device mockups
  const renderSocialPosts = () => {
    if (!data?.posts || !Array.isArray(data.posts)) return null;
    const posts = data.posts as Array<{ platform?: string; content?: string; hashtags?: string[] }>;
    if (posts.length === 0) return null;
    
    // Get company name from brand identity if available
    const brandName = (data?.brandIdentity as Record<string, unknown>)?.companyName as string || 'YourBrand';
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media Posts
          </h3>
          <Badge variant="outline" className="text-xs">{posts.length} Posts</Badge>
        </div>
        
        {/* Device Mockups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {posts.slice(0, 4).map((post, i) => (
            <div key={i} className="flex justify-center">
              <SocialPostMockup
                platform={post.platform?.toLowerCase() || 'instagram'}
                content={post.content || ''}
                hashtags={post.hashtags}
                brandName={brandName}
              />
            </div>
          ))}
        </div>
        
        {/* Additional posts as cards */}
        {posts.length > 4 && (
          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm text-muted-foreground">+ {posts.length - 4} more posts</p>
            {posts.slice(4).map((post, i) => (
              <div key={i + 4} className="p-4 border rounded-lg bg-white">
                {post.platform && (
                  <Badge variant="outline" className="mb-2">{post.platform}</Badge>
                )}
                <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                {post.hashtags && (
                  <p className="text-sm text-blue-500 mt-2">
                    {post.hashtags.map(h => `#${h}`).join(' ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render website copy with browser mockup
  const renderWebsiteCopy = () => {
    if (!data?.websiteCopy) return null;
    const copy = data.websiteCopy as Record<string, unknown>;
    const hero = copy.heroSection as Record<string, string> | undefined;
    const about = copy.aboutSection as Record<string, string> | undefined;
    const features = copy.featuresSection as Array<Record<string, string>> | undefined;
    // testimonials available in copy.testimonials if needed
    
    // Get company name for URL
    const companyName = (data?.brandIdentity as Record<string, unknown>)?.companyName as string || 'yoursite';
    const siteUrl = `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Website Preview
          </h3>
          <Badge variant="outline" className="text-xs">Landing Page</Badge>
        </div>
        
        {/* Browser Frame Mockup */}
        <BrowserFrame url={siteUrl}>
          {/* Hero Section */}
          {hero && (
            <div className="bg-gradient-to-b from-gray-50 to-white px-8 py-16 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {hero.headline || 'Your Headline Here'}
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {hero.subheadline || 'Your subheadline goes here'}
              </p>
              <div className="flex justify-center gap-3">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                  {hero.ctaPrimary || 'Get Started'}
                </button>
                {hero.ctaSecondary && (
                  <button className="border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
                    {hero.ctaSecondary}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* About Section */}
          {about != null && (
            <div className="px-8 py-12 bg-white">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                {String(about.title || 'About Us')}
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-3xl">
                {String(about.content || '')}
              </p>
            </div>
          )}

          {/* Features Section inside browser */}
          {features && Array.isArray(features) && features.length > 0 && (
            <div className="px-8 py-12 bg-gray-50">
              <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-semibold text-lg mb-2 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer inside browser */}
          {copy.footerTagline != null && (
            <div className="px-8 py-8 bg-gray-900 text-center">
              <p className="text-gray-400 text-sm italic">"{String(copy.footerTagline)}"</p>
            </div>
          )}
        </BrowserFrame>
      </div>
    );
  };

  // Render social media plan
  const renderSocialMediaPlan = () => {
    if (!data?.socialMediaPlan) return null;
    const plan = data.socialMediaPlan as Record<string, unknown>;
    const platforms = plan.platforms as Array<Record<string, unknown>> | undefined;
    const calendar = plan.contentCalendar as Array<{ week: number; posts: Array<Record<string, unknown>> }> | undefined;
    const hashtags = plan.brandHashtags as string[] | undefined;

    return (
      <div className="space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Social Media Strategy
        </h3>

        {/* Platforms */}
        {platforms && Array.isArray(platforms) && (
          <div className="space-y-3">
            <h4 className="font-medium">Platform Strategy</h4>
            <div className="grid gap-4">
              {platforms.map((platform, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-lg">{String(platform.name)}</h5>
                    <Badge variant="secondary">{String(platform.postingFrequency)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">@{String(platform.handle)}</p>
                  <p className="text-sm bg-muted/50 p-2 rounded">{String(platform.bio)}</p>
                  {Array.isArray(platform.contentPillars) && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {platform.contentPillars.map((pillar: string, j: number) => (
                        <Badge key={j} variant="outline" className="text-xs">{pillar}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Calendar */}
        {calendar && Array.isArray(calendar) && (
          <div className="space-y-3">
            <h4 className="font-medium">Content Calendar</h4>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-6">
                {calendar.map((week, i) => (
                  <div key={i} className="space-y-3">
                    <h5 className="font-semibold sticky top-0 bg-white dark:bg-gray-900 py-2 border-b">
                      Week {week.week}
                    </h5>
                    <div className="grid gap-3">
                      {week.posts.map((post, j) => (
                        <div key={j} className="text-sm p-3 bg-muted/20 rounded border-l-2 border-primary">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] uppercase">
                              {String(post.platform)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{String(post.type)}</span>
                          </div>
                          <p className="font-medium mb-1">{String(post.topic)}</p>
                          <p className="text-muted-foreground line-clamp-2">{String(post.caption)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Brand Hashtags */}
        {hashtags && Array.isArray(hashtags) && (
          <div className="space-y-2">
            <h4 className="font-medium">Brand Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, i) => (
                <Badge key={i} className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render market analysis
  const renderMarketAnalysis = () => {
    // Check for market analysis data structure
    if (!data?.insights && !data?.competitors) return null;
    
    const analysis = data as Record<string, unknown>;
    const insights = analysis.insights as Record<string, unknown> | undefined;
    const competitors = analysis.competitors as string[] | undefined;
    
    return (
      <div className="space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Market Analysis
        </h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-muted/20 rounded-lg border">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Target Market</h4>
            <p>{String(analysis.targetMarket || "N/A")}</p>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg border">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Industry</h4>
            <p>{String(analysis.industry || "N/A")}</p>
          </div>
        </div>

        {competitors && Array.isArray(competitors) && (
          <div className="space-y-2">
            <h4 className="font-medium">Competitors</h4>
            <div className="flex flex-wrap gap-2">
              {competitors.map((comp, i) => (
                <Badge key={i} variant="secondary">{comp}</Badge>
              ))}
            </div>
          </div>
        )}

        {insights != null && (
          <div className="space-y-4">
            <h4 className="font-medium border-b pb-2">Strategic Insights</h4>
            
            {insights.marketSize != null && (
              <div>
                <h5 className="text-sm font-semibold mb-1">Market Size</h5>
                <p className="text-sm text-muted-foreground">{String(insights.marketSize)}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {Array.isArray(insights.opportunities) && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-green-600">Opportunities</h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {insights.opportunities.map((opp: string, i: number) => (
                      <li key={i}>{opp}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {Array.isArray(insights.threats) && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-red-600">Threats</h5>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {insights.threats.map((threat: string, i: number) => (
                      <li key={i}>{threat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render brand guidelines
  const renderBrandGuidelines = () => {
    if (!data?.markdownContent || !data?.version) return null;
    const guidelines = data as Record<string, unknown>;
    
    return (
      <div className="space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Brand Guidelines
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
          <div>
            <h4 className="font-bold text-lg">{String(guidelines.companyName)}</h4>
            <p className="text-sm text-muted-foreground">Version {String(guidelines.version)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            // Download markdown content
            const blob = new Blob([String(guidelines.markdownContent)], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${String(guidelines.companyName).replace(/\s+/g, "_")}_Brand_Guidelines.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-4 w-4 mr-2" />
            Download Markdown
          </Button>
        </div>

        <ScrollArea className="h-[500px] rounded-md border p-6 bg-white dark:bg-gray-950">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-ul:list-disc prose-ol:list-decimal">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {String(guidelines.markdownContent)}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </div>
    );
  };

  // Determine what to render based on output data
  const renderPreview = () => {
    if (!data) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No preview data available</p>
          <p className="text-sm">View the raw data tab for details</p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {renderBrandIdentity()}
        {renderMessaging()}
        {renderTaglines()}
        {renderColorPalette()}
        {renderTypography()}
        {renderLogo()}
        {renderWebsiteCopy()}
        {renderSocialMediaPlan()}
        {renderSocialPosts()}
        {renderMarketAnalysis()}
        {renderBrandGuidelines()}
        
        {/* Fallback for other data types */}
        {!data.brandIdentity && !data.messagingFramework && !data.taglines && 
         !data.colorPalette && !data.typographySystem && !data.logoConcept && 
         !data.websiteCopy && !data.socialMediaPlan && !data.posts && 
         !data.insights && !data.markdownContent && (
          <div className="space-y-4">
            <h3 className="font-semibold">Output Data</h3>
            <pre className="p-4 bg-muted rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
              {formattedData}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          "bg-white rounded-xl shadow-2xl flex flex-col",
          isFullscreen ? "fixed inset-4" : "w-full max-w-4xl h-[85vh]"
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{output.name}</h2>
              <p className="text-sm text-muted-foreground">
                Generated by {output.createdBy} • {new Date(output.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-1"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "raw")} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 border-b shrink-0">
            <TabsList className="h-10">
              <TabsTrigger value="preview" className="gap-1">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="raw" className="gap-1">
                <Code className="h-4 w-4" />
                Raw Data
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex-1 min-h-0 overflow-auto m-0 p-6">
            {renderPreview()}
          </TabsContent>

          <TabsContent value="raw" className="flex-1 min-h-0 overflow-auto m-0">
            <pre className="p-6 text-sm font-mono whitespace-pre-wrap">
              {formattedData}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
