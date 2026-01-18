"use client";

import { useState } from "react";
import { Integration } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IntegrationSetupProps {
  integrations: Integration[];
  onConnect: (id: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}

const categoryNames = {
  communication: "Communication",
  development: "Development",
  design: "Design",
  productivity: "Productivity",
  sales: "Sales & CRM",
  finance: "Finance"
};

export function IntegrationSetup({
  integrations,
  onConnect,
  onContinue,
  onSkip
}: IntegrationSetupProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const required = integrations.filter(i => i.required);
  const optional = integrations.filter(i => !i.required);
  const connected = integrations.filter(i => i.status === 'connected').length;
  const allRequiredConnected = required.every(i => i.status === 'connected');

  const categories = Array.from(new Set(integrations.map(i => i.category)));

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(search.toLowerCase()) ||
      integration.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnect = async (id: string) => {
    setConnecting(id);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate OAuth
    onConnect(id);
    setConnecting(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-6">
        <h2 className="text-2xl font-bold mb-2">Connect Your Tools</h2>
        <p className="text-muted-foreground mb-4">
          Connect the integrations your AI departments need to work effectively.
        </p>

        <div className="flex items-center gap-4">
          <Badge variant={allRequiredConnected ? "default" : "secondary"} className="text-sm">
            {connected}/{integrations.length} connected
          </Badge>
          {!allRequiredConnected && (
            <div className="flex items-center gap-2 text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{required.length - required.filter(i => i.status === 'connected').length} required integrations remaining</span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {categoryNames[category]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Integrations List */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Required */}
        {required.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Required Integrations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {required.filter(i =>
                !search ||
                i.name.toLowerCase().includes(search.toLowerCase()) ||
                i.description.toLowerCase().includes(search.toLowerCase())
              ).map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={() => handleConnect(integration.id)}
                  isConnecting={connecting === integration.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional */}
        {optional.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Optional Integrations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {optional.filter(i =>
                !search ||
                i.name.toLowerCase().includes(search.toLowerCase()) ||
                i.description.toLowerCase().includes(search.toLowerCase())
              ).map(integration => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={() => handleConnect(integration.id)}
                  isConnecting={connecting === integration.id}
                />
              ))}
            </div>
          </div>
        )}

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No integrations found matching "{search}"
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {allRequiredConnected ? (
              <span className="text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                All required integrations connected
              </span>
            ) : (
              <span>Connect all required integrations to continue</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onSkip}>
              Skip for Now
            </Button>
            <Button onClick={onContinue} disabled={!allRequiredConnected}>
              Continue to Execution
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  integration: Integration;
  onConnect: () => void;
  isConnecting: boolean;
}

function IntegrationCard({ integration, onConnect, isConnecting }: IntegrationCardProps) {
  const isConnected = integration.status === 'connected';
  const isError = integration.status === 'error';

  return (
    <Card className={cn(
      "p-4 transition-all hover:shadow-md",
      isConnected && "border-green-300 bg-green-50",
      isError && "border-red-300 bg-red-50"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center text-xl",
          isConnected ? "bg-green-100" : "bg-gray-100"
        )}>
          {integration.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{integration.name}</h4>
            {integration.required && (
              <Badge variant="secondary" className="text-xs">Required</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {integration.description}
          </p>

          {isConnected ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Connected</span>
              {integration.connectedAs && (
                <span className="text-xs text-muted-foreground">
                  as {integration.connectedAs}
                </span>
              )}
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Connection failed</span>
              </div>
              <Button size="sm" variant="outline" onClick={onConnect}>
                Retry
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-3 w-3" />
                  Connect
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
