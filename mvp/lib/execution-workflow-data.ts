import { WorkflowGraph } from "./types";

// Mock workflow graph for execution - starts with all pending, simulation updates these
export const mockExecutionWorkflowGraph: WorkflowGraph = {
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
