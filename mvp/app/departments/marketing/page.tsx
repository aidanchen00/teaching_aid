"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ArrowLeft, Play, Settings, Megaphone, PanelLeft, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { AgentExecutionPanel } from "@/components/agents/agent-execution-panel";
import { MarketingOutputsPanel } from "@/components/agents/marketing-outputs-panel";
import { SessionSidebar } from "@/components/agents/session-sidebar";
import { useAgentExecution } from "@/lib/ai/hooks/useAgentExecution";

interface MarketingFormData {
  companyName: string;
  industry: string;
  targetAudience: string;
  productDescription: string;
  uniqueValue: string;
  tone: string;
  competitors: string;
}

const defaultFormData: MarketingFormData = {
  companyName: "",
  industry: "",
  targetAudience: "",
  productDescription: "",
  uniqueValue: "",
  tone: "Professional yet approachable",
  competitors: "",
};

export default function MarketingDepartmentPage() {
  const [formData, setFormData] = useState<MarketingFormData>(defaultFormData);
  const [showConfig, setShowConfig] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [sessionKey, setSessionKey] = useState(0); // Force refresh sidebar

  const {
    isRunning,
    error,
    agents,
    steps,
    toolCalls,
    result,
    execute,
    reset,
  } = useAgentExecution("marketing");

  const handleStart = async () => {
    if (!formData.companyName) {
      alert("Please enter a company name");
      return;
    }

    setShowConfig(false);
    await execute({
      companyName: formData.companyName,
      industry: formData.industry,
      targetAudience: formData.targetAudience,
      productDescription: formData.productDescription,
      uniqueValue: formData.uniqueValue,
      tone: formData.tone,
      competitors: formData.competitors,
    });
    // Refresh sidebar to show new session
    setSessionKey((k) => k + 1);
  };

  const handleReset = () => {
    reset();
    setShowConfig(true);
    setActiveSessionId(undefined);
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        const session = data.session;
        
        setActiveSessionId(sessionId);
        
        // If session is completed, show outputs
        if (session.status === "completed" && session.outputs) {
          setShowConfig(false);
          // The outputs will be displayed from the session data
        } else if (session.status === "draft") {
          // Load variables into form
          if (session.variables) {
            setFormData({
              companyName: session.variables.COMPANY_NAME || "",
              industry: session.variables.INDUSTRY || "",
              targetAudience: session.variables.TARGET_AUDIENCE || "",
              productDescription: session.variables.PRODUCT_DESCRIPTION || "",
              uniqueValue: session.variables.UNIQUE_VALUE || "",
              tone: session.variables.TONE || "Professional yet approachable",
              competitors: session.variables.COMPETITORS || "",
            });
          }
          setShowConfig(true);
        }
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
  };

  const handleNewSession = () => {
    reset();
    setFormData(defaultFormData);
    setShowConfig(true);
    setActiveSessionId(undefined);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (activeSessionId === sessionId) {
      handleNewSession();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/orchestrate">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#EC489915" }}
            >
              <Megaphone className="h-5 w-5" style={{ color: "#EC4899" }} />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Marketing & Brand</h1>
              <p className="text-sm text-muted-foreground">
                AI agents for brand strategy, design, content, and social media
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeft className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          {!isRunning && Object.keys(agents).length === 0 ? (
            <Button onClick={handleStart} disabled={!formData.companyName}>
              <Play className="h-4 w-4 mr-2" />
              Start Agents
            </Button>
          ) : (
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Session Sidebar */}
        {showSidebar && (
          <SessionSidebar
            key={sessionKey}
            departmentId="marketing"
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {/* Main Panel */}
        <div className="flex-1 overflow-hidden">
          {showConfig ? (
            <ConfigurationPanel
              formData={formData}
              onChange={setFormData}
              onStart={handleStart}
            />
          ) : (
            <ResizablePanelGroup orientation="horizontal" className="h-full">
              <ResizablePanel defaultSize={50} minSize={30}>
                <AgentExecutionPanel
                  agents={agents}
                  steps={steps}
                  toolCalls={toolCalls}
                  isRunning={isRunning}
                  onStart={handleStart}
                  onReset={handleReset}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />

              <ResizablePanel defaultSize={50} minSize={30}>
                <MarketingOutputsPanel outputs={result as Record<string, unknown> || {}} />
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg max-w-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

interface ConfigurationPanelProps {
  formData: MarketingFormData;
  onChange: (data: MarketingFormData) => void;
  onStart: () => void;
}

function ConfigurationPanel({
  formData,
  onChange,
  onStart,
}: ConfigurationPanelProps) {
  const updateField = (field: keyof MarketingFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-y-auto p-8"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Configure Your Brand</h2>
          <p className="text-muted-foreground">
            Provide details about your company to generate tailored brand assets
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                placeholder="e.g., Acme Corp"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Industry</label>
              <Input
                value={formData.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                placeholder="e.g., SaaS, E-commerce, FinTech"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Target Audience</label>
              <Textarea
                value={formData.targetAudience}
                onChange={(e) => updateField("targetAudience", e.target.value)}
                placeholder="e.g., Small business owners aged 30-50 who want to automate their operations"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Product Description</label>
              <Textarea
                value={formData.productDescription}
                onChange={(e) =>
                  updateField("productDescription", e.target.value)
                }
                placeholder="Describe what your product or service does..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Unique Value Proposition</label>
              <Textarea
                value={formData.uniqueValue}
                onChange={(e) => updateField("uniqueValue", e.target.value)}
                placeholder="What makes you different from competitors?"
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Brand Tone</label>
              <Input
                value={formData.tone}
                onChange={(e) => updateField("tone", e.target.value)}
                placeholder="e.g., Professional, Playful, Bold, Minimalist"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Competitors</label>
              <Input
                value={formData.competitors}
                onChange={(e) => updateField("competitors", e.target.value)}
                placeholder="e.g., Competitor A, Competitor B"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onStart} disabled={!formData.companyName} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Generate Brand Assets
            </Button>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            The AI agents will create: Brand Identity, Color Palette, Logo,
            Typography, Website Copy, Taglines, and Social Media Strategy
          </p>
        </div>
      </div>
    </motion.div>
  );
}
