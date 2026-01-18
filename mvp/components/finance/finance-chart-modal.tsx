"use client";

import type { FinanceArtifact } from "@/lib/ai/agents/finance";
import { Button } from "@/components/ui/button";
import {
  X,
  TrendingUp,
  PieChart,
  DollarSign,
  FileText,
  Download,
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

interface FinanceChartModalProps {
  artifact: FinanceArtifact;
  onClose: () => void;
}

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899"];

function RevenueChart({ data }: { data: { year: string; revenue: number; mrr: number; growth: number }[] }) {
  return (
    <div className="bg-white rounded-xl p-6">
      <h4 className="font-semibold mb-4">Revenue Projections</h4>
      <ResponsiveContainer width="100%" height={350}>
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
    <div className="bg-white rounded-xl p-6">
      <h4 className="font-semibold mb-4">Market Analysis (TAM/SAM/SOM)</h4>
      <ResponsiveContainer width="100%" height={350}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={120}
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
    <div className="bg-white rounded-xl p-6">
      <h4 className="font-semibold mb-4">Use of Funds</h4>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" stroke="#6B7280" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
          <YAxis type="category" dataKey="category" stroke="#6B7280" fontSize={12} width={120} />
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

const artifactIcons: Record<string, React.ElementType> = {
  executive_summary: FileText,
  revenue_projection: TrendingUp,
  market_analysis: PieChart,
  funding_requirements: DollarSign,
};

export function FinanceChartModal({ artifact, onClose }: FinanceChartModalProps) {
  const { data, type, title } = artifact;
  const Icon = artifactIcons[type] || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#10B98120" }}
            >
              <Icon className="h-5 w-5" style={{ color: "#10B981" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="text-sm text-muted-foreground">Financial Report</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {/* Summary for Executive Summary */}
          {type === "executive_summary" && data.summary && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
              <p className="text-emerald-900">{data.summary}</p>
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
            <div className="bg-white rounded-xl p-6 mt-6">
              <h4 className="font-semibold mb-4">Key Insights</h4>
              <ul className="space-y-3">
                {data.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-emerald-500 mt-0.5 text-lg">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
