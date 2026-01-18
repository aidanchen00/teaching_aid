import { WorkflowGraph, WorkflowNode } from "./types";

interface DemoResponse {
  response: string;
  workflowUpdate?: Partial<WorkflowGraph>;
  agentWorkflowUpdates?: Record<string, Partial<WorkflowGraph>>;
}

interface ChatTrigger {
  patterns: string[];
  handler: (content: string) => DemoResponse;
}

// Helper to check if content matches any pattern (case insensitive)
const matchesPattern = (content: string, patterns: string[]): boolean => {
  const lower = content.toLowerCase();
  return patterns.some(p => lower.includes(p.toLowerCase()));
};

// ============================================
// DEMO TRIGGERS AND RESPONSES
// ============================================

const demoTriggers: ChatTrigger[] = [
  // Add spreadsheet logging agent to Operations
  {
    patterns: [
      "spreadsheet logging",
      "logging in operations",
      "spreadsheet agent",
      "add logger to operations",
      "add logging agent"
    ],
    handler: () => ({
      response: `Great idea! I've added a **Spreadsheet Logger** agent to the Operations & Finance department.

This agent will:
- Automatically log all financial transactions to Google Sheets
- Create audit trails for compliance
- Generate weekly summary reports
- Sync data with QuickBooks

The workflow has been updated. Click on Operations & Finance to see the new agent configuration.`,
      agentWorkflowUpdates: {
        dept_operations: {
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
              id: "agent_spreadsheet_logger",
              type: "agent",
              label: "Spreadsheet Logger",
              description: "Logs all transactions and creates automated audit trails in Google Sheets",
              status: "pending",
              progress: 0,
              color: "#F59E0B",
              icon: "table",
              tools: ["Sheets", "QuickBooks"],
              position: { x: 550, y: 150 }
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
            { id: "edge_ops_1", source: "agent_ops_manager", target: "agent_legal_advisor", label: "Process docs", type: "dependency" },
            { id: "edge_ops_2", source: "agent_finance_manager", target: "agent_legal_advisor", label: "Financial setup", type: "dependency" },
            { id: "edge_ops_3", source: "agent_finance_manager", target: "agent_spreadsheet_logger", label: "Transaction data", type: "dependency" }
          ]
        }
      }
    })
  },

  // Refine engineering workflow for complex applications
  {
    patterns: [
      "complex application",
      "refine engineering",
      "scale engineering",
      "enterprise application",
      "microservices"
    ],
    handler: () => ({
      response: `I've refined the **Software Engineering** department for enterprise-scale applications.

New additions:
- **Security Engineer** - Handles auth, encryption, and vulnerability scanning
- **Database Architect** - Optimizes schemas and handles data modeling
- **QA Engineer** - Automated testing and quality assurance

The workflow now follows a more robust CI/CD pipeline with proper security gates. Click on Software Engineering to see the updated agent structure.`,
      agentWorkflowUpdates: {
        dept_engineering: {
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
              position: { x: 300, y: 0 }
            },
            {
              id: "agent_security_engineer",
              type: "agent",
              label: "Security Engineer",
              description: "Implements authentication, encryption, and security best practices",
              status: "pending",
              progress: 0,
              color: "#8B5CF6",
              icon: "shield",
              tools: ["GitHub"],
              position: { x: 100, y: 120 }
            },
            {
              id: "agent_database_architect",
              type: "agent",
              label: "Database Architect",
              description: "Designs optimized database schemas and data models",
              status: "pending",
              progress: 0,
              color: "#8B5CF6",
              icon: "database",
              tools: ["GitHub"],
              position: { x: 300, y: 120 }
            },
            {
              id: "agent_backend_engineer",
              type: "agent",
              label: "Backend Engineer",
              description: "Builds REST API, microservices, and business logic",
              status: "pending",
              progress: 0,
              color: "#8B5CF6",
              icon: "server",
              tools: ["GitHub", "Vercel"],
              position: { x: 500, y: 120 }
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
              position: { x: 200, y: 240 }
            },
            {
              id: "agent_qa_engineer",
              type: "agent",
              label: "QA Engineer",
              description: "Creates automated tests and ensures quality standards",
              status: "pending",
              progress: 0,
              color: "#8B5CF6",
              icon: "check-circle",
              tools: ["GitHub"],
              position: { x: 400, y: 240 }
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
              position: { x: 300, y: 360 }
            }
          ],
          edges: [
            { id: "edge_eng_1", source: "agent_tech_lead", target: "agent_security_engineer", label: "Security specs", type: "dependency" },
            { id: "edge_eng_2", source: "agent_tech_lead", target: "agent_database_architect", label: "Data requirements", type: "dependency" },
            { id: "edge_eng_3", source: "agent_tech_lead", target: "agent_backend_engineer", label: "Architecture specs", type: "dependency" },
            { id: "edge_eng_4", source: "agent_security_engineer", target: "agent_frontend_engineer", label: "Auth integration", type: "dependency" },
            { id: "edge_eng_5", source: "agent_database_architect", target: "agent_backend_engineer", label: "DB schemas", type: "dependency" },
            { id: "edge_eng_6", source: "agent_backend_engineer", target: "agent_frontend_engineer", label: "API contracts", type: "dependency" },
            { id: "edge_eng_7", source: "agent_frontend_engineer", target: "agent_qa_engineer", label: "UI components", type: "dependency" },
            { id: "edge_eng_8", source: "agent_backend_engineer", target: "agent_qa_engineer", label: "API endpoints", type: "dependency" },
            { id: "edge_eng_9", source: "agent_qa_engineer", target: "agent_devops", label: "Test suites", type: "dependency" }
          ]
        }
      }
    })
  },

  // Add influencer marketing
  {
    patterns: [
      "influencer",
      "creator marketing",
      "influencer outreach",
      "add influencer"
    ],
    handler: () => ({
      response: `I've added an **Influencer Marketing Manager** to the Marketing & Brand department.

This agent will:
- Research and identify relevant influencers in your niche
- Draft outreach templates and collaboration proposals
- Create affiliate/partnership agreements
- Track campaign performance metrics

Click on Marketing & Brand to see the updated workflow with the new influencer agent.`,
      agentWorkflowUpdates: {
        dept_marketing: {
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
              position: { x: 300, y: 0 }
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
              position: { x: 300, y: 150 }
            },
            {
              id: "agent_influencer_manager",
              type: "agent",
              label: "Influencer Manager",
              description: "Manages influencer outreach, partnerships, and creator collaborations",
              status: "pending",
              progress: 0,
              color: "#EC4899",
              icon: "users",
              tools: ["Notion", "HubSpot"],
              position: { x: 500, y: 150 }
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
              position: { x: 300, y: 300 }
            }
          ],
          edges: [
            { id: "edge_mkt_1", source: "agent_brand_strategist", target: "agent_designer", label: "Brand guidelines", type: "dependency" },
            { id: "edge_mkt_2", source: "agent_brand_strategist", target: "agent_content_writer", label: "Messaging framework", type: "dependency" },
            { id: "edge_mkt_3", source: "agent_brand_strategist", target: "agent_influencer_manager", label: "Brand guidelines", type: "dependency" },
            { id: "edge_mkt_4", source: "agent_designer", target: "agent_social_media", label: "Visual assets", type: "dependency" },
            { id: "edge_mkt_5", source: "agent_content_writer", target: "agent_social_media", label: "Content calendar", type: "dependency" },
            { id: "edge_mkt_6", source: "agent_influencer_manager", target: "agent_social_media", label: "Creator content", type: "dependency" }
          ]
        }
      }
    })
  },

  // Add customer support department
  {
    patterns: [
      "customer support",
      "add support",
      "help desk",
      "customer service",
      "support department"
    ],
    handler: () => ({
      response: `I've added a new **Customer Support** department to handle customer inquiries and issues.

The department includes:
- **Support Lead** - Defines support processes and SLAs
- **Knowledge Base Manager** - Creates help articles and FAQs
- **Support Agent** - Handles tickets and customer communication

This department will integrate with your existing Sales & Growth department for customer success handoffs.`,
      workflowUpdate: {
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
            id: "dept_support",
            type: "department",
            label: "Customer Support",
            description: "Handle customer inquiries and build help resources",
            status: "pending",
            progress: 0,
            color: "#06B6D4",
            icon: "headphones",
            tools: ["Zendesk", "Notion"],
            position: { x: 625, y: 300 }
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
          { id: "edge_1", source: "dept_business", target: "dept_engineering", label: "Business requirements", type: "dependency" },
          { id: "edge_2", source: "dept_business", target: "dept_marketing", label: "Brand strategy", type: "dependency" },
          { id: "edge_3", source: "dept_business", target: "dept_sales", label: "Sales targets", type: "dependency" },
          { id: "edge_4", source: "dept_business", target: "dept_operations", label: "Financial model", type: "dependency" },
          { id: "edge_5", source: "dept_marketing", target: "dept_sales", label: "Marketing assets", type: "dependency" },
          { id: "edge_6", source: "dept_sales", target: "dept_support", label: "Customer handoff", type: "dependency" },
          { id: "edge_7", source: "dept_marketing", target: "dept_support", label: "Brand voice", type: "dependency" }
        ]
      }
    })
  },

  // Make it faster / simplify
  {
    patterns: [
      "make it faster",
      "simplify",
      "too complex",
      "reduce agents",
      "streamline"
    ],
    handler: () => ({
      response: `I've streamlined the workflow for faster execution. Each department now has 2-3 focused agents instead of 4+.

Changes made:
- Merged overlapping roles
- Removed redundant handoffs
- Parallelized independent tasks

Estimated time reduced from ~25 minutes to ~15 minutes. The workflow is now optimized for MVP launch.`
    })
  },

  // Add AI/ML capabilities
  {
    patterns: [
      "add ai",
      "machine learning",
      "add ml",
      "ai features",
      "recommendation engine"
    ],
    handler: () => ({
      response: `I've enhanced the **Software Engineering** department with AI/ML capabilities.

New additions:
- **ML Engineer** - Builds recommendation engines and predictive models
- **Data Scientist** - Analyzes user behavior and creates training datasets

These agents will work with the Backend Engineer to integrate AI features into your product. The workflow includes proper data pipeline setup and model deployment.`
    })
  },

  // Remove a department
  {
    patterns: [
      "remove sales",
      "don't need sales",
      "skip sales",
      "remove department"
    ],
    handler: () => ({
      response: `I've removed the **Sales & Growth** department from the workflow.

The remaining departments will handle any sales-related tasks:
- Marketing will focus on inbound lead generation
- Operations will handle payment processing directly

The workflow has been reorganized to maintain proper dependencies without the Sales department.`
    })
  },

  // Add legal/compliance
  {
    patterns: [
      "gdpr",
      "compliance",
      "legal team",
      "privacy policy",
      "terms of service"
    ],
    handler: () => ({
      response: `I've strengthened the legal and compliance aspects across the organization.

Updates made:
- Added **Compliance Officer** agent to Operations & Finance
- Legal Advisor now has expanded scope for GDPR/CCPA compliance
- Privacy Policy and Terms of Service added to Marketing deliverables

All data-handling agents will now include privacy-by-design considerations in their outputs.`
    })
  },

  // Speed up specific department
  {
    patterns: [
      "speed up marketing",
      "faster marketing",
      "parallelize marketing"
    ],
    handler: () => ({
      response: `I've optimized the **Marketing & Brand** department for parallel execution.

Changes:
- Designer and Content Writer now work simultaneously
- Social Media Manager starts preparation while others finish
- Removed sequential dependencies where possible

Marketing deliverables will now complete 40% faster.`
    })
  }
];

// ============================================
// MAIN HANDLER FUNCTION
// ============================================

export function handleDemoChat(content: string): DemoResponse | null {
  for (const trigger of demoTriggers) {
    if (matchesPattern(content, trigger.patterns)) {
      return trigger.handler(content);
    }
  }
  return null;
}

// ============================================
// DEMO COMMAND SUGGESTIONS
// ============================================

export const demoCommands = [
  {
    category: "Add Agents",
    suggestions: [
      "Add a spreadsheet logging agent to Operations & Finance",
      "Add an influencer marketing manager",
      "Add AI/ML capabilities to engineering"
    ]
  },
  {
    category: "Modify Workflows",
    suggestions: [
      "Refine this workflow for complex enterprise applications",
      "Make it faster and simpler",
      "Speed up the marketing department"
    ]
  },
  {
    category: "Add Departments",
    suggestions: [
      "Add a customer support department",
      "Add a legal and compliance team"
    ]
  },
  {
    category: "Remove Elements",
    suggestions: [
      "Remove the sales department",
      "Streamline and reduce agents"
    ]
  }
];
