import { WorkflowGraph } from "./types";

// ============================================
// PLANNING PHASE AGENT WORKFLOWS (all pending)
// ============================================

export const businessStrategyAgentWorkflow: WorkflowGraph = {
  nodes: [
    {
      id: "agent_strategy_lead",
      type: "agent",
      label: "Strategy Lead",
      description: "Defines business model, value proposition, and go-to-market strategy",
      status: "pending",
      progress: 0,
      color: "#3B82F6",
      icon: "target",
      tools: ["Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_market_researcher",
      type: "agent",
      label: "Market Researcher",
      description: "Analyzes market size, competitors, and positioning opportunities",
      status: "pending",
      progress: 0,
      color: "#3B82F6",
      icon: "search",
      tools: ["Notion"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_financial_analyst",
      type: "agent",
      label: "Financial Analyst",
      description: "Creates 3-year financial projections and unit economics model",
      status: "pending",
      progress: 0,
      color: "#3B82F6",
      icon: "dollar-sign",
      tools: ["Sheets", "Notion"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_product_manager",
      type: "agent",
      label: "Product Manager",
      description: "Defines product roadmap and feature prioritization",
      status: "pending",
      progress: 0,
      color: "#3B82F6",
      icon: "layout",
      tools: ["Notion"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: [
    {
      id: "edge_bs_1",
      source: "agent_strategy_lead",
      target: "agent_market_researcher",
      label: "Market requirements",
      type: "dependency"
    },
    {
      id: "edge_bs_2",
      source: "agent_strategy_lead",
      target: "agent_financial_analyst",
      label: "Business model",
      type: "dependency"
    },
    {
      id: "edge_bs_3",
      source: "agent_market_researcher",
      target: "agent_product_manager",
      label: "Market insights",
      type: "dependency"
    },
    {
      id: "edge_bs_4",
      source: "agent_financial_analyst",
      target: "agent_product_manager",
      label: "Financial constraints",
      type: "dependency"
    }
  ]
};

export const engineeringAgentWorkflow: WorkflowGraph = {
  nodes: [
    {
      id: "agent_tech_lead",
      type: "agent",
      label: "Tech Lead",
      description: "Designs system architecture and technology stack decisions",
      status: "pending",
      progress: 0,
      color: "#8B5CF6",
      icon: "cpu",
      tools: ["GitHub", "Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_backend_engineer",
      type: "agent",
      label: "Backend Engineer",
      description: "Builds REST API, database schemas, and business logic",
      status: "pending",
      progress: 0,
      color: "#8B5CF6",
      icon: "server",
      tools: ["GitHub", "Vercel"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_frontend_engineer",
      type: "agent",
      label: "Frontend Engineer",
      description: "Develops user interface components and client-side logic",
      status: "pending",
      progress: 0,
      color: "#8B5CF6",
      icon: "monitor",
      tools: ["GitHub", "Vercel"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_devops",
      type: "agent",
      label: "DevOps Engineer",
      description: "Sets up CI/CD pipeline, monitoring, and infrastructure",
      status: "pending",
      progress: 0,
      color: "#8B5CF6",
      icon: "settings",
      tools: ["GitHub", "Vercel"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: [
    {
      id: "edge_eng_1",
      source: "agent_tech_lead",
      target: "agent_backend_engineer",
      label: "Architecture specs",
      type: "dependency"
    },
    {
      id: "edge_eng_2",
      source: "agent_tech_lead",
      target: "agent_frontend_engineer",
      label: "Design system",
      type: "dependency"
    },
    {
      id: "edge_eng_3",
      source: "agent_backend_engineer",
      target: "agent_frontend_engineer",
      label: "API contracts",
      type: "dependency"
    },
    {
      id: "edge_eng_4",
      source: "agent_backend_engineer",
      target: "agent_devops",
      label: "Deployment config",
      type: "dependency"
    },
    {
      id: "edge_eng_5",
      source: "agent_frontend_engineer",
      target: "agent_devops",
      label: "Build artifacts",
      type: "dependency"
    }
  ]
};

export const marketingAgentWorkflow: WorkflowGraph = {
  nodes: [
    {
      id: "agent_brand_strategist",
      type: "agent",
      label: "Brand Strategist",
      description: "Defines brand identity, voice, positioning, and messaging framework",
      status: "pending",
      progress: 0,
      color: "#EC4899",
      icon: "star",
      tools: ["Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_designer",
      type: "agent",
      label: "Designer",
      description: "Creates logo, brand assets, marketing materials, and visual identity",
      status: "pending",
      progress: 0,
      color: "#EC4899",
      icon: "palette",
      tools: ["Figma"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_content_writer",
      type: "agent",
      label: "Content Writer",
      description: "Writes website copy, landing pages, and marketing content",
      status: "pending",
      progress: 0,
      color: "#EC4899",
      icon: "pen-tool",
      tools: ["Notion"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_social_media",
      type: "agent",
      label: "Social Media Manager",
      description: "Plans social media strategy and creates post content",
      status: "pending",
      progress: 0,
      color: "#EC4899",
      icon: "share-2",
      tools: ["Notion"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: [
    {
      id: "edge_mkt_1",
      source: "agent_brand_strategist",
      target: "agent_designer",
      label: "Brand guidelines",
      type: "dependency"
    },
    {
      id: "edge_mkt_2",
      source: "agent_brand_strategist",
      target: "agent_content_writer",
      label: "Messaging framework",
      type: "dependency"
    },
    {
      id: "edge_mkt_3",
      source: "agent_designer",
      target: "agent_social_media",
      label: "Visual assets",
      type: "dependency"
    },
    {
      id: "edge_mkt_4",
      source: "agent_content_writer",
      target: "agent_social_media",
      label: "Content calendar",
      type: "dependency"
    }
  ]
};

export const salesAgentWorkflow: WorkflowGraph = {
  nodes: [
    {
      id: "agent_sales_strategist",
      type: "agent",
      label: "Sales Strategist",
      description: "Develops sales playbook, pricing strategy, and target segments",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "target",
      tools: ["Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_growth_hacker",
      type: "agent",
      label: "Growth Hacker",
      description: "Designs acquisition funnels and growth experiments",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "trending-up",
      tools: ["Notion", "HubSpot"],
      position: { x: 250, y: 150 }
    }
  ],
  edges: [
    {
      id: "edge_sales_1",
      source: "agent_sales_strategist",
      target: "agent_growth_hacker",
      label: "Sales targets",
      type: "dependency"
    }
  ]
};

export const operationsAgentWorkflow: WorkflowGraph = {
  nodes: [
    {
      id: "agent_ops_manager",
      type: "agent",
      label: "Operations Manager",
      description: "Sets up operational processes, workflows, and team structure",
      status: "pending",
      progress: 0,
      color: "#F59E0B",
      icon: "briefcase",
      tools: ["Notion"],
      position: { x: 100, y: 0 }
    },
    {
      id: "agent_finance_manager",
      type: "agent",
      label: "Finance Manager",
      description: "Configures accounting, invoicing, and financial reporting systems",
      status: "pending",
      progress: 0,
      color: "#F59E0B",
      icon: "dollar-sign",
      tools: ["Stripe", "QuickBooks"],
      position: { x: 400, y: 0 }
    },
    {
      id: "agent_legal_advisor",
      type: "agent",
      label: "Legal Advisor",
      description: "Reviews contracts, compliance, and legal requirements",
      status: "pending",
      progress: 0,
      color: "#F59E0B",
      icon: "file-text",
      tools: ["Notion"],
      position: { x: 250, y: 150 }
    }
  ],
  edges: [
    {
      id: "edge_ops_1",
      source: "agent_ops_manager",
      target: "agent_legal_advisor",
      label: "Process docs",
      type: "dependency"
    },
    {
      id: "edge_ops_2",
      source: "agent_finance_manager",
      target: "agent_legal_advisor",
      label: "Financial setup",
      type: "dependency"
    }
  ]
};

export const financeAgentWorkflow: WorkflowGraph = {
  nodes: [
    {
      id: "agent_financial_analyst",
      type: "agent",
      label: "Financial Analyst",
      description: "Analyzes financial data and creates executive summary",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "dollar-sign",
      tools: ["Sheets"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_revenue_analyst",
      type: "agent",
      label: "Revenue Analyst",
      description: "Creates revenue projections and growth forecasts",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "trending-up",
      tools: ["Sheets"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_market_analyst",
      type: "agent",
      label: "Market Analyst",
      description: "Analyzes TAM, SAM, SOM and market opportunities",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "pie-chart",
      tools: ["Sheets"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_funding_strategist",
      type: "agent",
      label: "Funding Strategist",
      description: "Plans funding requirements and use of funds allocation",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "bar-chart",
      tools: ["Sheets", "Notion"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: [
    {
      id: "edge_fin_1",
      source: "agent_financial_analyst",
      target: "agent_revenue_analyst",
      label: "Financial targets",
      type: "dependency"
    },
    {
      id: "edge_fin_2",
      source: "agent_financial_analyst",
      target: "agent_market_analyst",
      label: "Market scope",
      type: "dependency"
    },
    {
      id: "edge_fin_3",
      source: "agent_revenue_analyst",
      target: "agent_funding_strategist",
      label: "Revenue model",
      type: "dependency"
    },
    {
      id: "edge_fin_4",
      source: "agent_market_analyst",
      target: "agent_funding_strategist",
      label: "Market size",
      type: "dependency"
    }
  ]
};

// Map department IDs to their agent workflows (planning phase)
export const departmentAgentWorkflows: Record<string, WorkflowGraph> = {
  dept_business: businessStrategyAgentWorkflow,
  dept_engineering: engineeringAgentWorkflow,
  dept_marketing: marketingAgentWorkflow,
  dept_sales: salesAgentWorkflow,
  dept_operations: operationsAgentWorkflow,
  dept_finance: financeAgentWorkflow
};

// ============================================
// EXECUTION PHASE AGENT WORKFLOWS (with real statuses)
// ============================================

export const businessStrategyAgentWorkflowExecution: WorkflowGraph = {
  nodes: [
    {
      id: "agent_strategy_lead",
      type: "agent",
      label: "Strategy Lead",
      description: "Defines business model, value proposition, and go-to-market strategy",
      status: "completed",
      progress: 100,
      color: "#3B82F6",
      icon: "target",
      tools: ["Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_market_researcher",
      type: "agent",
      label: "Market Researcher",
      description: "Analyzes market size, competitors, and positioning opportunities",
      status: "completed",
      progress: 100,
      color: "#3B82F6",
      icon: "search",
      tools: ["Notion"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_financial_analyst",
      type: "agent",
      label: "Financial Analyst",
      description: "Creates 3-year financial projections and unit economics model",
      status: "completed",
      progress: 100,
      color: "#3B82F6",
      icon: "dollar-sign",
      tools: ["Sheets", "Notion"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_product_manager",
      type: "agent",
      label: "Product Manager",
      description: "Defines product roadmap and feature prioritization",
      status: "completed",
      progress: 100,
      color: "#3B82F6",
      icon: "layout",
      tools: ["Notion"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: businessStrategyAgentWorkflow.edges
};

export const engineeringAgentWorkflowExecution: WorkflowGraph = {
  nodes: [
    {
      id: "agent_tech_lead",
      type: "agent",
      label: "Tech Lead",
      description: "Designs system architecture and technology stack decisions",
      status: "completed",
      progress: 100,
      color: "#8B5CF6",
      icon: "cpu",
      tools: ["GitHub", "Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_backend_engineer",
      type: "agent",
      label: "Backend Engineer",
      description: "Builds REST API, database schemas, and business logic",
      status: "running",
      progress: 65,
      color: "#8B5CF6",
      icon: "server",
      tools: ["GitHub", "Vercel"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_frontend_engineer",
      type: "agent",
      label: "Frontend Engineer",
      description: "Develops user interface components and client-side logic",
      status: "pending",
      progress: 0,
      color: "#8B5CF6",
      icon: "monitor",
      tools: ["GitHub", "Vercel"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_devops",
      type: "agent",
      label: "DevOps Engineer",
      description: "Sets up CI/CD pipeline, monitoring, and infrastructure",
      status: "pending",
      progress: 0,
      color: "#8B5CF6",
      icon: "settings",
      tools: ["GitHub", "Vercel"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: engineeringAgentWorkflow.edges
};

export const marketingAgentWorkflowExecution: WorkflowGraph = {
  nodes: [
    {
      id: "agent_brand_strategist",
      type: "agent",
      label: "Brand Strategist",
      description: "Defines brand identity, voice, positioning, and messaging framework",
      status: "completed",
      progress: 100,
      color: "#EC4899",
      icon: "star",
      tools: ["Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_designer",
      type: "agent",
      label: "Designer",
      description: "Creates logo, brand assets, marketing materials, and visual identity",
      status: "needs_auth",
      progress: 0,
      color: "#EC4899",
      icon: "palette",
      tools: ["Figma"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_content_writer",
      type: "agent",
      label: "Content Writer",
      description: "Writes website copy, landing pages, and marketing content",
      status: "pending",
      progress: 0,
      color: "#EC4899",
      icon: "pen-tool",
      tools: ["Notion"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_social_media",
      type: "agent",
      label: "Social Media Manager",
      description: "Plans social media strategy and creates post content",
      status: "pending",
      progress: 0,
      color: "#EC4899",
      icon: "share-2",
      tools: ["Notion"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: marketingAgentWorkflow.edges
};

export const salesAgentWorkflowExecution: WorkflowGraph = {
  nodes: [
    {
      id: "agent_sales_strategist",
      type: "agent",
      label: "Sales Strategist",
      description: "Develops sales playbook, pricing strategy, and target segments",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "target",
      tools: ["Notion"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_growth_hacker",
      type: "agent",
      label: "Growth Hacker",
      description: "Designs acquisition funnels and growth experiments",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "trending-up",
      tools: ["Notion", "HubSpot"],
      position: { x: 250, y: 150 }
    }
  ],
  edges: salesAgentWorkflow.edges
};

export const operationsAgentWorkflowExecution: WorkflowGraph = {
  nodes: [
    {
      id: "agent_ops_manager",
      type: "agent",
      label: "Operations Manager",
      description: "Sets up operational processes, workflows, and team structure",
      status: "pending",
      progress: 0,
      color: "#F59E0B",
      icon: "briefcase",
      tools: ["Notion"],
      position: { x: 100, y: 0 }
    },
    {
      id: "agent_finance_manager",
      type: "agent",
      label: "Finance Manager",
      description: "Configures accounting, invoicing, and financial reporting systems",
      status: "pending",
      progress: 0,
      color: "#F59E0B",
      icon: "dollar-sign",
      tools: ["Stripe", "QuickBooks"],
      position: { x: 400, y: 0 }
    },
    {
      id: "agent_legal_advisor",
      type: "agent",
      label: "Legal Advisor",
      description: "Reviews contracts, compliance, and legal requirements",
      status: "pending",
      progress: 0,
      color: "#F59E0B",
      icon: "file-text",
      tools: ["Notion"],
      position: { x: 250, y: 150 }
    }
  ],
  edges: operationsAgentWorkflow.edges
};

export const financeAgentWorkflowExecution: WorkflowGraph = {
  nodes: [
    {
      id: "agent_financial_analyst",
      type: "agent",
      label: "Financial Analyst",
      description: "Analyzes financial data and creates executive summary",
      status: "completed",
      progress: 100,
      color: "#10B981",
      icon: "dollar-sign",
      tools: ["Sheets"],
      position: { x: 250, y: 0 }
    },
    {
      id: "agent_revenue_analyst",
      type: "agent",
      label: "Revenue Analyst",
      description: "Creates revenue projections and growth forecasts",
      status: "running",
      progress: 65,
      color: "#10B981",
      icon: "trending-up",
      tools: ["Sheets"],
      position: { x: 100, y: 150 }
    },
    {
      id: "agent_market_analyst",
      type: "agent",
      label: "Market Analyst",
      description: "Analyzes TAM, SAM, SOM and market opportunities",
      status: "running",
      progress: 45,
      color: "#10B981",
      icon: "pie-chart",
      tools: ["Sheets"],
      position: { x: 400, y: 150 }
    },
    {
      id: "agent_funding_strategist",
      type: "agent",
      label: "Funding Strategist",
      description: "Plans funding requirements and use of funds allocation",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "bar-chart",
      tools: ["Sheets", "Notion"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: financeAgentWorkflow.edges
};

// Map department IDs to their agent workflows (execution phase)
export const departmentAgentWorkflowsExecution: Record<string, WorkflowGraph> = {
  dept_business: businessStrategyAgentWorkflowExecution,
  dept_engineering: engineeringAgentWorkflowExecution,
  dept_marketing: marketingAgentWorkflowExecution,
  dept_sales: salesAgentWorkflowExecution,
  dept_operations: operationsAgentWorkflowExecution,
  dept_finance: financeAgentWorkflowExecution
};
