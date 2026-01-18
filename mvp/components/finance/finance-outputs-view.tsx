"use client";

import { useState } from "react";
import type { AgentExecutionState, AgentStep } from "@/lib/ai/types";
import type { FinanceArtifact } from "@/lib/ai/agents/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  X,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  FileText,
  Loader2,
  AlertCircle,
  BarChart3,
  RefreshCw,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface FinanceOutputsViewProps {
  isRunning: boolean;
  error: string | null;
  agents: Record<string, AgentExecutionState>;
  steps: AgentStep[];
  artifacts: FinanceArtifact[];
  onClose: () => void;
}

const artifactIcons: Record<string, React.ElementType> = {
  executive_summary: FileText,
  revenue_projection: TrendingUp,
  market_analysis: PieChart,
  funding_requirements: DollarSign,
};

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];

function MetricCard({ label, value, change, trend }: { label: string; value: string; change?: string; trend?: "up" | "down" | "neutral" }) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-gray-400";

  return (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 mt-1 text-sm ${trendColor}`}>
          <TrendIcon className="h-4 w-4" />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }: { data: { year: string; revenue: number; mrr: number; growth: number }[] }) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h4 className="font-semibold mb-4">Revenue Projections</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
          <Tooltip
            formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}M`, ""]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
          />
          <Legend />
          <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" dot={{ fill: "#10B981" }} />
          <Line type="monotone" dataKey="mrr" stroke="#3B82F6" strokeWidth={2} name="MRR" dot={{ fill: "#3B82F6" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MarketChart({ data }: { data: { segment: string; value: number; color: string }[] }) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h4 className="font-semibold mb-4">Market Analysis (TAM/SAM/SOM)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="segment"
            label={({ segment, value }) => `${segment}: $${value}B`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`$${value}B`, "Market Size"]} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

function FundingChart({ data }: { data: { category: string; amount: number; percentage: number }[] }) {
  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <h4 className="font-semibold mb-4">Use of Funds</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" stroke="#6B7280" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <YAxis type="category" dataKey="category" stroke="#6B7280" fontSize={12} width={100} />
          <Tooltip
            formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, "Amount"]}
            contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
          />
          <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ReportContent({ artifact }: { artifact: FinanceArtifact }) {
  const { data, type } = artifact;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      {data.metrics && data.metrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.metrics.map((metric, i) => (
            <MetricCard key={i} {...metric} />
          ))}
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-blue-900">{data.summary}</p>
        </div>
      )}

      {/* Charts based on type */}
      {type === "revenue_projection" && data.revenueData && (
        <RevenueChart data={data.revenueData} />
      )}

      {type === "market_analysis" && data.marketData && (
        <MarketChart data={data.marketData} />
      )}

      {type === "funding_requirements" && data.fundingData && (
        <FundingChart data={data.fundingData} />
      )}

      {/* Insights */}
      {data.insights && data.insights.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold mb-3">Key Insights</h4>
          <ul className="space-y-2">
            {data.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-emerald-500 mt-1">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function FinanceOutputsView({
  isRunning,
  error,
  steps,
  artifacts,
  onClose,
}: FinanceOutputsViewProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(
    artifacts.length > 0 ? artifacts[0].id : null
  );

  const currentArtifact = artifacts.find((a) => a.id === selectedArtifact);
  const progress = artifacts.length * 25;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#10B98120" }}
          >
            <DollarSign className="h-5 w-5" style={{ color: "#10B981" }} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Financial Analysis</h2>
            <p className="text-sm text-muted-foreground">
              {isRunning
                ? "Generating financial reports..."
                : error
                ? "Error occurred"
                : `${artifacts.length} reports generated`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <Badge variant="secondary" className="gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Generating reports</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Artifacts List */}
        <div className="w-72 border-r bg-gray-50 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Reports
          </h3>
          <div className="space-y-2">
            {artifacts.length === 0 && !isRunning ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No reports generated yet
              </p>
            ) : (
              artifacts.map((artifact) => {
                const Icon = artifactIcons[artifact.type] || FileText;
                return (
                  <button
                    key={artifact.id}
                    onClick={() => setSelectedArtifact(artifact.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedArtifact === artifact.id
                        ? "bg-white shadow-sm border border-gray-200"
                        : "hover:bg-white/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {artifact.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(artifact.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
            {isRunning && (
              <div className="flex items-center gap-3 p-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Generating...</span>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 mt-6">
            Activity
          </h3>
          <div className="space-y-2">
            {steps.slice(-5).map((step) => (
              <div
                key={step.id}
                className="text-xs text-muted-foreground py-1 border-l-2 border-gray-200 pl-3"
              >
                {step.content}
              </div>
            ))}
          </div>
        </div>

        {/* Report Preview */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {currentArtifact ? (
            <>
              <div className="border-b px-6 py-3 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = artifactIcons[currentArtifact.type] || FileText;
                    return <Icon className="h-5 w-5 text-emerald-600" />;
                  })()}
                  <span className="font-semibold">{currentArtifact.title}</span>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                <ReportContent artifact={currentArtifact} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a report to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
