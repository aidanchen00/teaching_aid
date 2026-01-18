"use client";

import { useState, useMemo } from "react";
import { ExecutionOutput } from "@/lib/types";
import type { FinanceArtifact } from "@/lib/ai/agents/finance";
import type { BusinessArtifact } from "@/lib/ai/agents/business";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Download,
  FileText,
  Palette,
  Type,
  Image,
  MessageSquare,
  Share2,
  Globe,
  Code,
  DollarSign,
  TrendingUp,
  PieChart,
  BarChart3,
  Presentation,
  Target,
  Briefcase,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Megaphone,
  Calculator,
  Layers,
  FileDown,
  FolderOpen,
  BookOpen,
  Send,
  FileCheck,
  Zap,
} from "lucide-react";

interface FinalDashboardProps {
  companyName: string;
  marketingOutputs: ExecutionOutput[];
  businessArtifacts: BusinessArtifact[];
  financeArtifacts: FinanceArtifact[];
  engineeringFiles: Record<string, string>;
  sandboxUrl?: string;
  // Track tool calls for communications
  toolCalls?: Array<{
    toolName: string;
    args?: Record<string, unknown>;
    result?: unknown;
    status: string;
    completedAt?: Date;
  }>;
  onClose: () => void;
  onPreviewMarketing?: (output: ExecutionOutput) => void;
  onPreviewFinance?: (artifact: FinanceArtifact) => void;
  onPreviewBusiness?: () => void;
}

// Color palette preview component
function ColorPalettePreview({ data }: { data: Record<string, unknown> }) {
  const colors = useMemo(() => {
    const result: Array<{ name: string; hex: string }> = [];
    if (data?.colorPalette) {
      const palette = data.colorPalette as Record<string, { hex?: string }>;
      if (palette.primary?.hex) result.push({ name: "Primary", hex: palette.primary.hex });
      if (palette.secondary?.hex) result.push({ name: "Secondary", hex: palette.secondary.hex });
      if (palette.accent?.hex) result.push({ name: "Accent", hex: palette.accent.hex });
    }
    return result;
  }, [data]);

  if (colors.length === 0) return null;

  return (
    <div className="flex gap-1 mt-2">
      {colors.map((c) => (
        <div
          key={c.name}
          className="h-6 w-6 rounded-full border border-white shadow-sm"
          style={{ backgroundColor: c.hex }}
          title={`${c.name}: ${c.hex}`}
        />
      ))}
    </div>
  );
}

// Logo preview component
function LogoPreview({ data }: { data: Record<string, unknown> }) {
  const svgCode = (data?.logoConcept as { svgCode?: string })?.svgCode;
  if (!svgCode) return null;

  return (
    <div
      className="mt-2 h-12 w-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svgCode }}
    />
  );
}

// Slide preview thumbnail
function SlidePreview({ artifact, color }: { artifact: BusinessArtifact; color: string }) {
  const slides = artifact.data.presentation?.slides || [];
  const firstSlide = slides[0];
  if (!firstSlide) return null;

  return (
    <div className="mt-3 bg-gray-100 rounded-lg p-2">
      <div className="bg-white rounded shadow-sm overflow-hidden aspect-[16/9]">
        <div className="h-4 w-full px-2 flex items-center" style={{ backgroundColor: color }}>
          <span className="text-white text-[8px] font-medium truncate">{firstSlide.title}</span>
        </div>
        <div className="p-2">
          {firstSlide.bullets?.slice(0, 2).map((b, i) => (
            <div key={i} className="flex items-start gap-1 text-[7px] text-gray-600">
              <span style={{ color }}>•</span>
              <span className="line-clamp-1">{b}</span>
            </div>
          ))}
          {(firstSlide.bullets?.length || 0) > 2 && (
            <div className="text-[6px] text-gray-400">+{(firstSlide.bullets?.length || 0) - 2} more</div>
          )}
        </div>
      </div>
      <div className="text-center text-[10px] text-muted-foreground mt-1">
        {artifact.data.slideCount || slides.length} slides
      </div>
    </div>
  );
}

// Chart preview for finance
function ChartPreview({ artifact }: { artifact: FinanceArtifact }) {
  // Use revenueData for revenue projections
  const revenueData = artifact.data.revenueData;
  if (!revenueData || !Array.isArray(revenueData) || revenueData.length === 0) return null;

  const maxVal = Math.max(...revenueData.map(d => d.revenue || 0));

  return (
    <div className="mt-3 bg-gray-100 rounded-lg p-2">
      <div className="flex items-end gap-1 h-12">
        {revenueData.slice(0, 5).map((d, i) => {
          const val = d.revenue || 0;
          const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-emerald-500 rounded-t"
                style={{ height: `${height}%`, minHeight: 4 }}
              />
              <span className="text-[8px] text-gray-500 mt-1">{d.year?.slice(-2) || `Y${i + 1}`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  subtext
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  subtext?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
    </Card>
  );
}

// Section header
function SectionHeader({
  icon: Icon,
  title,
  color,
  count,
  badge
}: {
  icon: React.ElementType;
  title: string;
  color: string;
  count?: number;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h3 className="font-semibold">{title}</h3>
        {count !== undefined && (
          <Badge variant="secondary" className="text-xs">{count} items</Badge>
        )}
      </div>
      {badge && (
        <Badge style={{ backgroundColor: color, color: "white" }}>{badge}</Badge>
      )}
    </div>
  );
}

export function FinalDashboard({
  companyName,
  marketingOutputs,
  businessArtifacts,
  financeArtifacts,
  engineeringFiles,
  sandboxUrl,
  toolCalls = [],
  onClose,
  onPreviewMarketing,
  onPreviewFinance,
  onPreviewBusiness,
}: FinalDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Internal preview state
  const [previewMarketingOutput, setPreviewMarketingOutput] = useState<ExecutionOutput | null>(null);
  const [previewFinanceArtifact, setPreviewFinanceArtifact] = useState<FinanceArtifact | null>(null);
  const [previewBusinessArtifact, setPreviewBusinessArtifact] = useState<BusinessArtifact | null>(null);

  // Extract communications from tool calls
  const communications = useMemo(() => {
    const emails: Array<{ to: string; subject: string; sentAt: Date; body?: string }> = [];
    const notionPages: Array<{ title: string; url?: string; createdAt: Date }> = [];

    toolCalls.forEach((tc) => {
      if (tc.status !== "completed") return;

      // Gmail emails
      if (tc.toolName === "GMAIL_SEND_EMAIL" || tc.toolName.toLowerCase().includes("gmail")) {
        const args = tc.args as { recipient_email?: string; subject?: string; body?: string } | undefined;
        if (args?.recipient_email) {
          emails.push({
            to: args.recipient_email,
            subject: args.subject || "Email",
            body: args.body,
            sentAt: tc.completedAt || new Date(),
          });
        }
      }

      // Notion pages
      if (tc.toolName === "NOTION_CREATE_NOTION_PAGE" || tc.toolName.toLowerCase().includes("notion_create")) {
        const args = tc.args as { title?: string } | undefined;
        const result = tc.result as { data?: { url?: string } } | undefined;
        notionPages.push({
          title: args?.title || `${companyName} Marketing Strategy`,
          url: result?.data?.url,
          createdAt: tc.completedAt || new Date(),
        });
      }
    });

    return { emails, notionPages };
  }, [toolCalls, companyName]);

  // Calculate stats
  const totalOutputs = marketingOutputs.length + businessArtifacts.length +
                       financeArtifacts.length + Object.keys(engineeringFiles).length;
  const totalSlides = businessArtifacts.reduce((acc, a) => acc + (a.data.slideCount || 0), 0);
  const totalFiles = Object.keys(engineeringFiles).length;
  const totalComms = communications.emails.length + communications.notionPages.length;

  // Helper to download JSON
  const downloadJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to download PPTX
  const downloadPPTX = (base64: string, title: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download all
  const downloadAll = () => {
    marketingOutputs.forEach((output, i) => {
      setTimeout(() => {
        downloadJSON(output.data, `marketing_${output.name.replace(/\s+/g, "_")}.json`);
      }, i * 200);
    });

    businessArtifacts.forEach((artifact, i) => {
      if (artifact.data.pptxBase64) {
        setTimeout(() => {
          downloadPPTX(artifact.data.pptxBase64!, artifact.title);
        }, (marketingOutputs.length + i) * 200);
      }
    });

    financeArtifacts.forEach((artifact, i) => {
      setTimeout(() => {
        downloadJSON(artifact.data, `finance_${artifact.title.replace(/\s+/g, "_")}.json`);
      }, (marketingOutputs.length + businessArtifacts.length + i) * 200);
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Icon and color maps
  const marketingIconMap: Record<string, React.ElementType> = {
    "Brand Identity": Building2,
    "Color Palette": Palette,
    "Color": Palette,
    "Typography": Type,
    "Logo": Image,
    "Website": Globe,
    "Tagline": MessageSquare,
    "Social": Share2,
    "Messaging": FileText,
    "Guidelines": BookOpen,
  };

  const getMarketingIcon = (name: string) => {
    for (const [key, Icon] of Object.entries(marketingIconMap)) {
      if (name.toLowerCase().includes(key.toLowerCase())) return Icon;
    }
    return FileText;
  };

  const businessColorMap: Record<string, string> = {
    pitch_deck: "#3B82F6",
    business_plan: "#8B5CF6",
    competitive_analysis: "#F59E0B",
    go_to_market: "#10B981",
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{companyName} Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              All your generated assets in one place
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={downloadAll}>
            <FileDown className="h-4 w-4 mr-2" />
            Download All
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <StatCard
            icon={Layers}
            label="Total Outputs"
            value={totalOutputs}
            color="#8B5CF6"
            subtext="Generated assets"
          />
          <StatCard
            icon={Megaphone}
            label="Marketing"
            value={marketingOutputs.length}
            color="#EC4899"
            subtext="Brand assets"
          />
          <StatCard
            icon={Presentation}
            label="Presentations"
            value={totalSlides}
            color="#3B82F6"
            subtext={`${businessArtifacts.length} decks`}
          />
          <StatCard
            icon={Calculator}
            label="Finance"
            value={financeArtifacts.length}
            color="#10B981"
            subtext="Reports"
          />
          <StatCard
            icon={Code}
            label="Code Files"
            value={totalFiles}
            color="#6366F1"
            subtext="Landing page"
          />
          <StatCard
            icon={Send}
            label="Communications"
            value={totalComms}
            color="#F59E0B"
            subtext={`${communications.emails.length} emails, ${communications.notionPages.length} pages`}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b bg-white px-6 flex-shrink-0">
            <TabsList className="h-12">
              <TabsTrigger value="overview" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="marketing" className="gap-2">
                <Megaphone className="h-4 w-4" />
                Marketing
              </TabsTrigger>
              <TabsTrigger value="business" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="finance" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Finance
              </TabsTrigger>
              <TabsTrigger value="engineering" className="gap-2">
                <Code className="h-4 w-4" />
                Engineering
              </TabsTrigger>
              <TabsTrigger value="communications" className="gap-2">
                <Mail className="h-4 w-4" />
                Communications
                {totalComms > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{totalComms}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-8 mt-0">
              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sandboxUrl && (
                    <Card
                      className="p-4 cursor-pointer hover:shadow-md transition-all border-2 border-blue-200 bg-blue-50"
                      onClick={() => window.open(sandboxUrl, "_blank")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">View Landing Page</p>
                          <p className="text-xs text-muted-foreground">Live preview</p>
                        </div>
                        <ExternalLink className="h-4 w-4 ml-auto text-blue-600" />
                      </div>
                    </Card>
                  )}
                  {businessArtifacts.length > 0 && (
                    <Card
                      className="p-4 cursor-pointer hover:shadow-md transition-all border-2 border-indigo-200 bg-indigo-50"
                      onClick={() => setPreviewBusinessArtifact(businessArtifacts[0] || null)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Presentation className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">View Pitch Deck</p>
                          <p className="text-xs text-muted-foreground">{totalSlides} slides</p>
                        </div>
                      </div>
                    </Card>
                  )}
                  {communications.notionPages.length > 0 && communications.notionPages[0].url && (
                    <Card
                      className="p-4 cursor-pointer hover:shadow-md transition-all border-2 border-amber-200 bg-amber-50"
                      onClick={() => window.open(communications.notionPages[0].url, "_blank")}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">View Notion</p>
                          <p className="text-xs text-muted-foreground">Brand strategy</p>
                        </div>
                        <ExternalLink className="h-4 w-4 ml-auto text-amber-600" />
                      </div>
                    </Card>
                  )}
                  <Card
                    className="p-4 cursor-pointer hover:shadow-md transition-all"
                    onClick={downloadAll}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileDown className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Download All</p>
                        <p className="text-xs text-muted-foreground">{totalOutputs} files</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Artifact Grid with Previews */}
              <div>
                <h3 className="font-semibold mb-4">All Generated Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Marketing outputs with previews */}
                  {marketingOutputs.map((output) => {
                    const Icon = getMarketingIcon(output.name);
                    const isColorPalette = output.name.toLowerCase().includes("color");
                    const isLogo = output.name.toLowerCase().includes("logo");

                    return (
                      <Card key={output.id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-pink-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">{output.name}</h4>
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground">{output.createdBy}</p>
                          </div>
                        </div>
                        {/* Preview based on type */}
                        {isColorPalette && output.data && <ColorPalettePreview data={output.data} />}
                        {isLogo && output.data && <LogoPreview data={output.data} />}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setPreviewMarketingOutput(output)}>
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadJSON(output.data, `${output.name}.json`)}>
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}

                  {/* Business presentations with slide previews */}
                  {businessArtifacts.map((artifact) => {
                    const color = businessColorMap[artifact.type] || "#3B82F6";
                    const iconMap: Record<string, React.ElementType> = {
                      pitch_deck: Presentation,
                      business_plan: FileText,
                      competitive_analysis: Target,
                      go_to_market: TrendingUp,
                    };
                    const Icon = iconMap[artifact.type] || Briefcase;

                    return (
                      <Card key={artifact.id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="h-5 w-5" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">{artifact.title}</h4>
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground">{artifact.data.slideCount || 0} slides</p>
                          </div>
                        </div>
                        <SlidePreview artifact={artifact} color={color} />
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setPreviewBusinessArtifact(businessArtifacts[0] || null)}>
                            Preview
                          </Button>
                          {artifact.data.pptxBase64 && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadPPTX(artifact.data.pptxBase64!, artifact.title)}>
                              <Download className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}

                  {/* Finance with chart previews */}
                  {financeArtifacts.map((artifact) => {
                    const iconMap: Record<string, React.ElementType> = {
                      executive_summary: FileText,
                      revenue_projection: TrendingUp,
                      market_analysis: PieChart,
                      funding_requirements: BarChart3,
                    };
                    const Icon = iconMap[artifact.type] || DollarSign;

                    return (
                      <Card key={artifact.id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm truncate">{artifact.title}</h4>
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-muted-foreground">Financial analysis</p>
                          </div>
                        </div>
                        {artifact.type === "revenue_projection" && <ChartPreview artifact={artifact} />}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setPreviewFinanceArtifact(artifact)}>
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadJSON(artifact.data, `${artifact.title}.json`)}>
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}

                  {/* Engineering */}
                  {totalFiles > 0 && (
                    <Card className="p-4 hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Code className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">Landing Page</h4>
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground">{totalFiles} files</p>
                        </div>
                      </div>
                      {/* File preview */}
                      <div className="mt-3 bg-gray-100 rounded-lg p-2">
                        <div className="space-y-1">
                          {Object.keys(engineeringFiles).slice(0, 3).map((file) => (
                            <div key={file} className="flex items-center gap-2 text-[10px] text-gray-600">
                              <Code className="h-3 w-3" />
                              <span className="font-mono truncate">{file}</span>
                            </div>
                          ))}
                          {totalFiles > 3 && (
                            <div className="text-[10px] text-gray-400">+{totalFiles - 3} more files</div>
                          )}
                        </div>
                      </div>
                      {sandboxUrl && (
                        <Button size="sm" variant="outline" className="h-7 text-xs w-full mt-3" onClick={() => window.open(sandboxUrl, "_blank")}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Live Site
                        </Button>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Marketing Tab */}
            <TabsContent value="marketing" className="p-6 mt-0">
              <SectionHeader
                icon={Megaphone}
                title="Marketing & Brand Assets"
                color="#EC4899"
                count={marketingOutputs.length}
                badge="Complete"
              />

              {marketingOutputs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {marketingOutputs.map((output) => {
                    const Icon = getMarketingIcon(output.name);
                    const isColorPalette = output.name.toLowerCase().includes("color");
                    const isLogo = output.name.toLowerCase().includes("logo");

                    return (
                      <Card key={output.id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-pink-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{output.name}</h4>
                            <p className="text-xs text-muted-foreground">{output.createdBy}</p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        {isColorPalette && output.data && <ColorPalettePreview data={output.data} />}
                        {isLogo && output.data && <LogoPreview data={output.data} />}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setPreviewMarketingOutput(output)}>
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => downloadJSON(output.data, `${output.name}.json`)}>
                            <Download className="h-3 w-3 mr-1" />
                            JSON
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">No marketing outputs generated yet</p>
                </Card>
              )}
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="p-6 mt-0">
              <SectionHeader
                icon={Briefcase}
                title="Business Presentations"
                color="#3B82F6"
                count={businessArtifacts.length}
                badge={`${totalSlides} slides`}
              />

              {businessArtifacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {businessArtifacts.map((artifact) => {
                    const color = businessColorMap[artifact.type] || "#3B82F6";
                    const iconMap: Record<string, React.ElementType> = {
                      pitch_deck: Presentation,
                      business_plan: FileText,
                      competitive_analysis: Target,
                      go_to_market: TrendingUp,
                    };
                    const Icon = iconMap[artifact.type] || Briefcase;

                    return (
                      <Card key={artifact.id} className="p-5">
                        <div className="flex items-start gap-4">
                          <div
                            className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="h-6 w-6" style={{ color }} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{artifact.title}</h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {artifact.data.slideCount || 0} slides
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => setPreviewBusinessArtifact(businessArtifacts[0] || null)}>
                                Preview
                              </Button>
                              {artifact.data.pptxBase64 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => downloadPPTX(artifact.data.pptxBase64!, artifact.title)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  PPTX
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        <SlidePreview artifact={artifact} color={color} />
                        {artifact.data.insights && artifact.data.insights.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Insights</p>
                            <ul className="space-y-1">
                              {artifact.data.insights.slice(0, 3).map((insight, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <Zap className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">No business presentations generated yet</p>
                </Card>
              )}
            </TabsContent>

            {/* Finance Tab */}
            <TabsContent value="finance" className="p-6 mt-0">
              <SectionHeader
                icon={DollarSign}
                title="Financial Analysis"
                color="#10B981"
                count={financeArtifacts.length}
                badge="Complete"
              />

              {financeArtifacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {financeArtifacts.map((artifact) => {
                    const iconMap: Record<string, React.ElementType> = {
                      executive_summary: FileText,
                      revenue_projection: TrendingUp,
                      market_analysis: PieChart,
                      funding_requirements: BarChart3,
                    };
                    const Icon = iconMap[artifact.type] || DollarSign;

                    return (
                      <Card key={artifact.id} className="p-4 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{artifact.title}</h4>
                            <p className="text-xs text-muted-foreground">Financial report</p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                        {artifact.type === "revenue_projection" && <ChartPreview artifact={artifact} />}
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => setPreviewFinanceArtifact(artifact)}>
                            View Chart
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={() => downloadJSON(artifact.data, `${artifact.title}.json`)}>
                            <Download className="h-3 w-3 mr-1" />
                            JSON
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Calculator className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">No finance reports generated yet</p>
                </Card>
              )}
            </TabsContent>

            {/* Engineering Tab */}
            <TabsContent value="engineering" className="p-6 mt-0">
              <SectionHeader
                icon={Code}
                title="Software Engineering"
                color="#6366F1"
                count={totalFiles}
                badge={sandboxUrl ? "Live" : "Complete"}
              />

              {totalFiles > 0 ? (
                <div className="space-y-6">
                  {sandboxUrl && (
                    <Card className="p-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Globe className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">Landing Page</h4>
                            <p className="text-sm text-muted-foreground">
                              Your website is live and ready to view
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => copyToClipboard(sandboxUrl, "url")}
                          >
                            {copiedItem === "url" ? (
                              <Check className="h-4 w-4 mr-2" />
                            ) : (
                              <Copy className="h-4 w-4 mr-2" />
                            )}
                            Copy URL
                          </Button>
                          <Button onClick={() => window.open(sandboxUrl, "_blank")}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Live Site
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  <div>
                    <h4 className="font-medium mb-3">Generated Files</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.keys(engineeringFiles).map((filepath) => (
                        <Card key={filepath} className="p-3">
                          <div className="flex items-center gap-3">
                            <Code className="h-4 w-4 text-indigo-500" />
                            <span className="text-sm font-mono truncate">{filepath}</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Code className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">No code files generated yet</p>
                </Card>
              )}
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent value="communications" className="p-6 mt-0">
              <SectionHeader
                icon={Mail}
                title="Communications & Integrations"
                color="#F59E0B"
                count={totalComms}
              />

              <div className="space-y-6">
                {/* Emails Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium">Emails Sent</h4>
                    <Badge variant="secondary">{communications.emails.length}</Badge>
                  </div>
                  {communications.emails.length > 0 ? (
                    <div className="space-y-3">
                      {communications.emails.map((email, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm">{email.subject}</h5>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                To: {email.to} • {new Date(email.sentAt).toLocaleString()}
                              </p>
                              {email.body && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{email.body}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-6 text-center border-dashed">
                      <Mail className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">No emails sent yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Emails are sent via Gmail integration when the marketing agent runs
                      </p>
                    </Card>
                  )}
                </div>

                {/* Notion Pages Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <h4 className="font-medium">Notion Pages</h4>
                    <Badge variant="secondary">{communications.notionPages.length}</Badge>
                  </div>
                  {communications.notionPages.length > 0 ? (
                    <div className="space-y-3">
                      {communications.notionPages.map((page, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <FileCheck className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-sm">{page.title}</h5>
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Created {new Date(page.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {page.url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(page.url, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Open
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-6 text-center border-dashed">
                      <BookOpen className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-muted-foreground">No Notion pages created yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Brand strategy is saved to Notion when available
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t bg-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          All departments completed successfully
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Dashboard
          </Button>
          <Button size="sm" onClick={downloadAll}>
            <Download className="h-4 w-4 mr-2" />
            Export All Assets
          </Button>
        </div>
      </div>

      {/* Internal Marketing Preview Modal */}
      {previewMarketingOutput && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl max-h-[80vh] mx-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{previewMarketingOutput.name}</h3>
                  <p className="text-sm text-muted-foreground">{previewMarketingOutput.createdBy}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewMarketingOutput(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(previewMarketingOutput.data, null, 2)}
              </pre>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={() => setPreviewMarketingOutput(null)}>
                Close
              </Button>
              <Button onClick={() => downloadJSON(previewMarketingOutput.data, `${previewMarketingOutput.name}.json`)}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Internal Business Preview Modal */}
      {previewBusinessArtifact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-4xl max-h-[90vh] mx-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Presentation className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{previewBusinessArtifact.title}</h3>
                  <p className="text-sm text-muted-foreground">{previewBusinessArtifact.data.slideCount || 0} slides</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewBusinessArtifact(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Slide carousel */}
              <div className="space-y-4">
                {previewBusinessArtifact.data.presentation?.slides?.map((slide, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline">Slide {i + 1}</Badge>
                      <h4 className="font-semibold">{slide.title}</h4>
                    </div>
                    {slide.bullets && slide.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {slide.bullets.map((bullet, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {slide.notes && (
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t italic">
                        {slide.notes}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={() => setPreviewBusinessArtifact(null)}>
                Close
              </Button>
              {previewBusinessArtifact.data.pptxBase64 && (
                <Button onClick={() => downloadPPTX(previewBusinessArtifact.data.pptxBase64!, previewBusinessArtifact.title)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PPTX
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Internal Finance Preview Modal */}
      {previewFinanceArtifact && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-3xl max-h-[80vh] mx-4 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{previewFinanceArtifact.title}</h3>
                  <p className="text-sm text-muted-foreground">Financial Report</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPreviewFinanceArtifact(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {/* Summary */}
              {previewFinanceArtifact.data.summary && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">{previewFinanceArtifact.data.summary}</p>
                </div>
              )}

              {/* Revenue Chart */}
              {previewFinanceArtifact.data.revenueData && previewFinanceArtifact.data.revenueData.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Revenue Projection</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-end gap-2 h-40">
                      {previewFinanceArtifact.data.revenueData.map((d, i) => {
                        const maxRev = Math.max(...previewFinanceArtifact.data.revenueData!.map(r => r.revenue || 0));
                        const height = maxRev > 0 ? ((d.revenue || 0) / maxRev) * 100 : 0;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div className="text-xs text-muted-foreground mb-1">
                              ${((d.revenue || 0) / 1000000).toFixed(1)}M
                            </div>
                            <div
                              className="w-full bg-emerald-500 rounded-t transition-all"
                              style={{ height: `${height}%`, minHeight: 8 }}
                            />
                            <span className="text-xs text-gray-600 mt-2">{d.year}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Insights */}
              {previewFinanceArtifact.data.insights && previewFinanceArtifact.data.insights.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Key Insights</h4>
                  <ul className="space-y-2">
                    {previewFinanceArtifact.data.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics */}
              {previewFinanceArtifact.data.metrics && previewFinanceArtifact.data.metrics.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {previewFinanceArtifact.data.metrics.map((metric, i) => (
                      <Card key={i} className="p-3">
                        <p className="text-xs text-muted-foreground">{metric.label}</p>
                        <p className="text-lg font-bold">{metric.value}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 p-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={() => setPreviewFinanceArtifact(null)}>
                Close
              </Button>
              <Button onClick={() => downloadJSON(previewFinanceArtifact.data, `${previewFinanceArtifact.title}.json`)}>
                <Download className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
