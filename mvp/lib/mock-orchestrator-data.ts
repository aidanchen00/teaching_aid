import {
  Phase,
  ChatMessage,
  Plan,
  Integration,
  ExecutionOutput,
  WorkflowGraph
} from "./types";

// Mock workflow graph for planning (no status/progress)
export const mockWorkflowGraph: WorkflowGraph = {
  nodes: [
    {
      id: "dept_business",
      type: "department",
      label: "Business Strategy",
      description: "Define business model, market positioning, and financial projections",
      status: "pending",
      progress: 0,
      color: "#3B82F6",
      icon: "target",
      tools: ["Notion", "Sheets"],
      position: { x: 250, y: 0 }
    },
    {
      id: "dept_engineering",
      type: "department",
      label: "Software Engineering",
      description: "Build technical architecture and core product",
      status: "pending",
      progress: 0,
      color: "#8B5CF6",
      icon: "code",
      tools: ["GitHub", "Vercel"],
      position: { x: 0, y: 150 }
    },
    {
      id: "dept_marketing",
      type: "department",
      label: "Marketing & Brand",
      description: "Create brand identity and marketing materials",
      status: "pending",
      progress: 0,
      color: "#EC4899",
      icon: "megaphone",
      tools: ["Figma", "Notion"],
      position: { x: 250, y: 150 }
    },
    {
      id: "dept_sales",
      type: "department",
      label: "Sales & Growth",
      description: "Develop sales strategy and growth playbook",
      status: "pending",
      progress: 0,
      color: "#10B981",
      icon: "trending-up",
      tools: ["HubSpot"],
      position: { x: 500, y: 150 }
    },
    {
      id: "dept_operations",
      type: "department",
      label: "Operations & Finance",
      description: "Set up operational processes and financial systems",
      status: "pending",
      progress: 0,
      color: "#F59E0B",
      icon: "briefcase",
      tools: ["Stripe", "QuickBooks"],
      position: { x: 250, y: 300 }
    }
  ],
  edges: [
    {
      id: "edge_1",
      source: "dept_business",
      target: "dept_engineering",
      label: "Business requirements",
      type: "dependency"
    },
    {
      id: "edge_2",
      source: "dept_business",
      target: "dept_marketing",
      label: "Brand strategy",
      type: "dependency"
    },
    {
      id: "edge_3",
      source: "dept_business",
      target: "dept_sales",
      label: "Sales targets",
      type: "dependency"
    },
    {
      id: "edge_4",
      source: "dept_business",
      target: "dept_operations",
      label: "Financial model",
      type: "dependency"
    },
    {
      id: "edge_5",
      source: "dept_marketing",
      target: "dept_sales",
      label: "Marketing assets",
      type: "dependency"
    }
  ]
};

// Mock integrations
export const mockIntegrations: Integration[] = [
  {
    id: "int_github",
    name: "GitHub",
    description: "Version control and code collaboration",
    icon: "🐙",
    category: "development",
    status: "connected",
    required: true,
    connectedAs: "openpreneurship-bot",
    scopes: ["repo", "workflow"]
  },
  {
    id: "int_notion",
    name: "Notion",
    description: "Documentation and knowledge management",
    icon: "📝",
    category: "productivity",
    status: "connected",
    required: true,
    connectedAs: "steve@openpreneurship.dev"
  },
  {
    id: "int_figma",
    name: "Figma",
    description: "Design and prototyping",
    icon: "🎨",
    category: "design",
    status: "disconnected",
    required: true
  },
  {
    id: "int_vercel",
    name: "Vercel",
    description: "Deployment and hosting",
    icon: "▲",
    category: "development",
    status: "connected",
    required: false,
    connectedAs: "steve@openpreneurship.dev"
  },
  {
    id: "int_sheets",
    name: "Google Sheets",
    description: "Spreadsheets and data analysis",
    icon: "📊",
    category: "productivity",
    status: "connected",
    required: false,
    connectedAs: "steve@openpreneurship.dev"
  },
  {
    id: "int_hubspot",
    name: "HubSpot",
    description: "CRM and sales automation",
    icon: "🚀",
    category: "sales",
    status: "disconnected",
    required: false
  },
  {
    id: "int_stripe",
    name: "Stripe",
    description: "Payment processing",
    icon: "💳",
    category: "finance",
    status: "disconnected",
    required: false
  },
  {
    id: "int_slack",
    name: "Slack",
    description: "Team communication",
    icon: "💬",
    category: "communication",
    status: "disconnected",
    required: false
  }
];

// Mock plan
export const mockPlan: Plan = {
  id: "plan_001",
  name: "Project Management SaaS",
  description: "A modern project management tool for remote teams with real-time collaboration",
  workflow: mockWorkflowGraph,
  integrations: mockIntegrations,
  estimatedTime: "~25 minutes",
  approved: false
};

// Mock initial messages - use fixed date to avoid hydration mismatch
export const mockInitialMessages: ChatMessage[] = [
  {
    id: "msg_1",
    role: "system",
    content: "Conversation started",
    timestamp: new Date("2024-01-01T12:00:00")
  }
];

// Mock execution outputs - organized by department and timing
export const mockOutputs: ExecutionOutput[] = [
  // Business Strategy outputs (completed first)
  {
    id: "out_1",
    name: "Business Plan.pdf",
    type: "file",
    createdBy: "Business Strategy",
    createdAt: new Date(Date.now() - 180000),
    departmentId: "dept_business",
    url: "/mock/business-plan.pdf"
  },
  {
    id: "out_2",
    name: "Financial Model",
    type: "link",
    createdBy: "Business Strategy",
    createdAt: new Date(Date.now() - 120000),
    departmentId: "dept_business",
    url: "https://docs.google.com/spreadsheets/..."
  },
  // Engineering outputs
  {
    id: "out_3",
    name: "Technical Architecture",
    type: "file",
    createdBy: "Software Engineering",
    createdAt: new Date(Date.now() - 60000),
    departmentId: "dept_engineering",
    url: "/mock/architecture.md"
  },
  {
    id: "out_4",
    name: "API Documentation",
    type: "file",
    createdBy: "Software Engineering",
    createdAt: new Date(Date.now() - 45000),
    departmentId: "dept_engineering",
    url: "/mock/api-docs.md"
  },
  {
    id: "out_5",
    name: "GitHub Repository",
    type: "link",
    createdBy: "Software Engineering",
    createdAt: new Date(Date.now() - 30000),
    departmentId: "dept_engineering",
    url: "https://github.com/openpreneurship/project-pm"
  },
  // Marketing outputs
  {
    id: "out_6",
    name: "Brand Guidelines.pdf",
    type: "file",
    createdBy: "Marketing & Brand",
    createdAt: new Date(Date.now() - 50000),
    departmentId: "dept_marketing",
    url: "/mock/brand-guidelines.pdf"
  },
  {
    id: "out_7",
    name: "Logo Assets",
    type: "file",
    createdBy: "Marketing & Brand",
    createdAt: new Date(Date.now() - 40000),
    departmentId: "dept_marketing",
    url: "/mock/logo-assets.zip"
  },
  {
    id: "out_8",
    name: "Landing Page Copy",
    type: "file",
    createdBy: "Marketing & Brand",
    createdAt: new Date(Date.now() - 25000),
    departmentId: "dept_marketing",
    url: "/mock/landing-copy.md"
  },
  // Sales outputs
  {
    id: "out_9",
    name: "Sales Playbook",
    type: "file",
    createdBy: "Sales & Growth",
    createdAt: new Date(Date.now() - 20000),
    departmentId: "dept_sales",
    url: "/mock/sales-playbook.pdf"
  },
  {
    id: "out_10",
    name: "Pricing Strategy",
    type: "file",
    createdBy: "Sales & Growth",
    createdAt: new Date(Date.now() - 15000),
    departmentId: "dept_sales",
    url: "/mock/pricing.pdf"
  },
  // Operations outputs
  {
    id: "out_11",
    name: "Operations Manual",
    type: "file",
    createdBy: "Operations & Finance",
    createdAt: new Date(Date.now() - 10000),
    departmentId: "dept_operations",
    url: "/mock/ops-manual.pdf"
  },
  {
    id: "out_12",
    name: "Legal Documents",
    type: "file",
    createdBy: "Operations & Finance",
    createdAt: new Date(Date.now() - 5000),
    departmentId: "dept_operations",
    url: "/mock/legal-docs.zip"
  }
];
