export type AgentStatus = 'completed' | 'working' | 'queued' | 'error';
export type DepartmentStatus = 'waiting' | 'running' | 'completed' | 'error' | 'needs_auth';
export type ToolStatus = 'connected' | 'disconnected' | 'in_use' | 'error';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentTask?: string;
  completedAt?: string; // e.g., "5m ago"
  duration?: string; // e.g., "3m"
  description: string;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  status: ToolStatus;
  connectedAs?: string;
  lastUsed?: string;
  reason?: string;
  url?: string;
}

export interface Output {
  id: string;
  name: string;
  type: 'pdf' | 'markdown' | 'link' | 'code' | 'sheet' | 'design';
  status: 'ready' | 'in_progress' | 'pending';
  size?: string;
  createdBy: string;
  createdAt: string;
  progress?: number;
  storedIn?: string;
  url?: string;
  downloadUrl?: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  departmentId: string;
  departmentName: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  agentName?: string;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  icon: string;
  status: DepartmentStatus;
  progress: number;
  agents: Agent[];
  tools: Tool[];
  outputs: Output[];
  currentActivity?: string;
  timeElapsed?: string;
  estimatedTimeRemaining?: string;
  errorMessage?: string;
  waitingFor?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  overallProgress: number;
  timeElapsed: string;
  departments: Department[];
  activities: Activity[];
  totalAgents: number;
  totalOutputs: number;
  toolsConnected: number;
}

export const mockProject: Project = {
  id: 'proj_001',
  name: 'Project Management SaaS',
  description: 'Building a modern project management tool for remote teams',
  overallProgress: 58,
  timeElapsed: '23m',
  totalAgents: 12,
  totalOutputs: 8,
  toolsConnected: 5,
  departments: [
    {
      id: 'dept_business',
      name: 'Business Strategy',
      color: '#3B82F6',
      icon: 'target',
      status: 'completed',
      progress: 100,
      timeElapsed: '18m',
      agents: [
        {
          id: 'agent_bs_1',
          name: 'Strategy Lead',
          role: 'Business Model & Strategy',
          status: 'completed',
          completedAt: '5m ago',
          duration: '8m',
          description: 'Defines business model, value proposition, and go-to-market strategy'
        },
        {
          id: 'agent_bs_2',
          name: 'Financial Analyst',
          role: 'Financial Planning',
          status: 'completed',
          completedAt: '2m ago',
          duration: '7m',
          description: 'Creates financial projections and unit economics'
        },
        {
          id: 'agent_bs_3',
          name: 'Market Researcher',
          role: 'Market Analysis',
          status: 'completed',
          completedAt: '8m ago',
          duration: '5m',
          description: 'Analyzes market size, competitors, and positioning'
        }
      ],
      tools: [
        {
          id: 'tool_notion_1',
          name: 'Notion',
          icon: 'file-text',
          status: 'connected',
          connectedAs: 'steve@openpreneurship.dev',
          lastUsed: '5m ago',
          url: 'https://notion.so/workspace'
        },
        {
          id: 'tool_sheets_1',
          name: 'Google Sheets',
          icon: 'sheet',
          status: 'connected',
          connectedAs: 'steve@openpreneurship.dev',
          lastUsed: '2m ago',
          url: 'https://docs.google.com/spreadsheets'
        }
      ],
      outputs: [
        {
          id: 'output_bs_1',
          name: 'Business Plan',
          type: 'pdf',
          status: 'ready',
          size: '156 KB',
          createdBy: 'Strategy Lead',
          createdAt: '5m ago',
          storedIn: 'Notion',
          url: 'https://notion.so/business-plan',
          downloadUrl: '/mock/business-plan.pdf'
        },
        {
          id: 'output_bs_2',
          name: 'Financial Model',
          type: 'sheet',
          status: 'ready',
          createdBy: 'Financial Analyst',
          createdAt: '2m ago',
          storedIn: 'Google Sheets',
          url: 'https://docs.google.com/spreadsheets/financial-model'
        },
        {
          id: 'output_bs_3',
          name: 'Market Research Report',
          type: 'markdown',
          status: 'ready',
          size: '89 KB',
          createdBy: 'Market Researcher',
          createdAt: '8m ago',
          storedIn: 'Notion',
          url: 'https://notion.so/market-research'
        }
      ],
      currentActivity: 'All tasks completed successfully'
    },
    {
      id: 'dept_engineering',
      name: 'Software Engineering',
      color: '#8B5CF6',
      icon: 'code',
      status: 'running',
      progress: 65,
      timeElapsed: '13m',
      estimatedTimeRemaining: '8m',
      agents: [
        {
          id: 'agent_eng_1',
          name: 'Tech Lead',
          role: 'Architecture & Planning',
          status: 'completed',
          completedAt: '7m ago',
          duration: '6m',
          description: 'Designs system architecture and tech stack'
        },
        {
          id: 'agent_eng_2',
          name: 'Backend Engineer',
          role: 'API Development',
          status: 'working',
          currentTask: 'Building REST API endpoints for project management...',
          duration: '5m',
          description: 'Builds backend services and APIs'
        },
        {
          id: 'agent_eng_3',
          name: 'Frontend Engineer',
          role: 'UI Development',
          status: 'queued',
          description: 'Builds user interface and components'
        }
      ],
      tools: [
        {
          id: 'tool_github_1',
          name: 'GitHub',
          icon: 'github',
          status: 'in_use',
          connectedAs: 'openpreneurship-bot',
          lastUsed: '1m ago',
          url: 'https://github.com/openpreneurship/project-mgmt'
        },
        {
          id: 'tool_vercel_1',
          name: 'Vercel',
          icon: 'triangle',
          status: 'connected',
          connectedAs: 'steve@openpreneurship.dev',
          lastUsed: '7m ago',
          url: 'https://vercel.com/openpreneurship/project-mgmt'
        }
      ],
      outputs: [
        {
          id: 'output_eng_1',
          name: 'Technical Architecture Doc',
          type: 'markdown',
          status: 'ready',
          size: '45 KB',
          createdBy: 'Tech Lead',
          createdAt: '7m ago',
          storedIn: 'GitHub',
          url: 'https://github.com/openpreneurship/project-mgmt/architecture.md'
        },
        {
          id: 'output_eng_2',
          name: 'Backend API Code',
          type: 'code',
          status: 'in_progress',
          progress: 65,
          createdBy: 'Backend Engineer',
          createdAt: 'in progress'
        }
      ],
      currentActivity: 'Backend Engineer is building REST API endpoints for project management...'
    },
    {
      id: 'dept_marketing',
      name: 'Marketing & Brand',
      color: '#EC4899',
      icon: 'megaphone',
      status: 'needs_auth',
      progress: 35,
      timeElapsed: '8m',
      agents: [
        {
          id: 'agent_mkt_1',
          name: 'Brand Strategist',
          role: 'Brand Identity',
          status: 'completed',
          completedAt: '4m ago',
          duration: '4m',
          description: 'Creates brand identity, voice, and messaging'
        },
        {
          id: 'agent_mkt_2',
          name: 'Content Writer',
          role: 'Content Creation',
          status: 'queued',
          description: 'Writes marketing copy and content'
        },
        {
          id: 'agent_mkt_3',
          name: 'Designer',
          role: 'Visual Design',
          status: 'queued',
          description: 'Creates logos, graphics, and visual assets'
        }
      ],
      tools: [
        {
          id: 'tool_figma_1',
          name: 'Figma',
          icon: 'figma',
          status: 'disconnected',
          reason: 'Designer needs access to create logo and visual assets'
        },
        {
          id: 'tool_notion_2',
          name: 'Notion',
          icon: 'file-text',
          status: 'connected',
          connectedAs: 'steve@openpreneurship.dev',
          lastUsed: '4m ago'
        }
      ],
      outputs: [
        {
          id: 'output_mkt_1',
          name: 'Brand Guidelines',
          type: 'pdf',
          status: 'ready',
          size: '2.3 MB',
          createdBy: 'Brand Strategist',
          createdAt: '4m ago',
          storedIn: 'Notion'
        },
        {
          id: 'output_mkt_2',
          name: 'Logo Design',
          type: 'design',
          status: 'pending',
          createdBy: 'Designer',
          createdAt: 'pending'
        }
      ],
      currentActivity: 'Waiting for Figma connection to continue...',
      waitingFor: 'Figma access'
    },
    {
      id: 'dept_sales',
      name: 'Sales & Growth',
      color: '#10B981',
      icon: 'trending-up',
      status: 'waiting',
      progress: 0,
      agents: [
        {
          id: 'agent_sales_1',
          name: 'Sales Strategist',
          role: 'Sales Strategy',
          status: 'queued',
          description: 'Develops sales playbook and go-to-market strategy'
        },
        {
          id: 'agent_sales_2',
          name: 'Growth Hacker',
          role: 'Growth Strategy',
          status: 'queued',
          description: 'Plans acquisition channels and growth tactics'
        }
      ],
      tools: [
        {
          id: 'tool_hubspot_1',
          name: 'HubSpot',
          icon: 'users',
          status: 'disconnected'
        }
      ],
      outputs: [],
      currentActivity: 'Waiting for Marketing & Brand to complete...',
      waitingFor: 'Marketing & Brand department',
      estimatedTimeRemaining: '15m'
    },
    {
      id: 'dept_operations',
      name: 'Operations & Finance',
      color: '#F59E0B',
      icon: 'briefcase',
      status: 'waiting',
      progress: 0,
      agents: [
        {
          id: 'agent_ops_1',
          name: 'Operations Manager',
          role: 'Operations Planning',
          status: 'queued',
          description: 'Sets up operational processes and workflows'
        },
        {
          id: 'agent_ops_2',
          name: 'Finance Manager',
          role: 'Financial Operations',
          status: 'queued',
          description: 'Handles accounting, invoicing, and financial ops'
        }
      ],
      tools: [
        {
          id: 'tool_stripe_1',
          name: 'Stripe',
          icon: 'credit-card',
          status: 'disconnected'
        },
        {
          id: 'tool_quickbooks_1',
          name: 'QuickBooks',
          icon: 'dollar-sign',
          status: 'disconnected'
        }
      ],
      outputs: [],
      currentActivity: 'Waiting for Business Strategy to complete...',
      waitingFor: 'Business Strategy department',
      estimatedTimeRemaining: '20m'
    }
  ],
  activities: [
    {
      id: 'act_001',
      timestamp: '1m ago',
      departmentId: 'dept_engineering',
      departmentName: 'Software Engineering',
      message: 'Backend Engineer pushed code to GitHub',
      type: 'success',
      agentName: 'Backend Engineer'
    },
    {
      id: 'act_002',
      timestamp: '2m ago',
      departmentId: 'dept_business',
      departmentName: 'Business Strategy',
      message: 'Financial Analyst completed financial projections',
      type: 'success',
      agentName: 'Financial Analyst'
    },
    {
      id: 'act_003',
      timestamp: '4m ago',
      departmentId: 'dept_marketing',
      departmentName: 'Marketing & Brand',
      message: 'Brand Strategist completed brand guidelines',
      type: 'success',
      agentName: 'Brand Strategist'
    },
    {
      id: 'act_004',
      timestamp: '4m ago',
      departmentId: 'dept_marketing',
      departmentName: 'Marketing & Brand',
      message: 'Waiting for Figma connection',
      type: 'warning',
      agentName: 'Designer'
    },
    {
      id: 'act_005',
      timestamp: '5m ago',
      departmentId: 'dept_business',
      departmentName: 'Business Strategy',
      message: 'Strategy Lead saved business plan to Notion',
      type: 'info',
      agentName: 'Strategy Lead'
    },
    {
      id: 'act_006',
      timestamp: '7m ago',
      departmentId: 'dept_engineering',
      departmentName: 'Software Engineering',
      message: 'Tech Lead completed technical architecture',
      type: 'success',
      agentName: 'Tech Lead'
    },
    {
      id: 'act_007',
      timestamp: '8m ago',
      departmentId: 'dept_business',
      departmentName: 'Business Strategy',
      message: 'Market Researcher completed market analysis',
      type: 'success',
      agentName: 'Market Researcher'
    },
    {
      id: 'act_008',
      timestamp: '10m ago',
      departmentId: 'dept_engineering',
      departmentName: 'Software Engineering',
      message: 'Backend Engineer started API development',
      type: 'info',
      agentName: 'Backend Engineer'
    }
  ]
};
