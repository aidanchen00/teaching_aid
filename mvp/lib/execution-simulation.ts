import { WorkflowGraph, WorkflowNode, ExecutionOutput } from "./types";

// Execution timeline - departments can run concurrently based on dependencies
// Business Strategy must complete first, then others can run in parallel

interface SimulationStep {
  time: number; // ms from start
  updates: {
    nodeId: string;
    status: WorkflowNode["status"];
    progress: number;
  }[];
  outputs?: ExecutionOutput[];
  chatMessage?: string;
}

// Create timestamped output
const createOutput = (
  id: string,
  name: string,
  type: "file" | "link" | "code" | "text",
  createdBy: string,
  departmentId: string,
  url: string
): ExecutionOutput => ({
  id,
  name,
  type,
  createdBy,
  createdAt: new Date(),
  departmentId,
  url
});

// Full execution timeline (slowed down for better demo experience ~55 seconds total)
export const executionTimeline: SimulationStep[] = [
  // T+0: Business Strategy starts
  {
    time: 0,
    updates: [
      { nodeId: "dept_business", status: "running", progress: 5 }
    ],
    chatMessage: "Business Strategy department is starting. The Strategy Lead is analyzing your requirements..."
  },
  // T+3s: Business progresses
  {
    time: 3000,
    updates: [
      { nodeId: "dept_business", status: "running", progress: 20 }
    ]
  },
  // T+6s: Business progresses more
  {
    time: 6000,
    updates: [
      { nodeId: "dept_business", status: "running", progress: 40 }
    ]
  },
  // T+9s: Business continues
  {
    time: 9000,
    updates: [
      { nodeId: "dept_business", status: "running", progress: 60 }
    ]
  },
  // T+12s: Business almost done
  {
    time: 12000,
    updates: [
      { nodeId: "dept_business", status: "running", progress: 80 }
    ]
  },
  // T+15s: Business at 95%
  {
    time: 15000,
    updates: [
      { nodeId: "dept_business", status: "running", progress: 95 }
    ]
  },
  // T+18s: Business completes, dependent departments start
  {
    time: 18000,
    updates: [
      { nodeId: "dept_business", status: "completed", progress: 100 },
      { nodeId: "dept_engineering", status: "running", progress: 5 },
      { nodeId: "dept_marketing", status: "running", progress: 5 },
      { nodeId: "dept_sales", status: "running", progress: 5 },
      { nodeId: "dept_operations", status: "running", progress: 5 }
    ],
    outputs: [
      createOutput("out_1", "Business Plan.pdf", "file", "Business Strategy", "dept_business", "/mock/business-plan.pdf"),
      createOutput("out_2", "Financial Model", "link", "Business Strategy", "dept_business", "https://docs.google.com/spreadsheets/...")
    ],
    chatMessage: "Business Strategy complete! Now Engineering, Marketing, Sales, and Operations are working in parallel..."
  },
  // T+21s: All departments progress
  {
    time: 21000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 15 },
      { nodeId: "dept_marketing", status: "running", progress: 20 },
      { nodeId: "dept_sales", status: "running", progress: 12 },
      { nodeId: "dept_operations", status: "running", progress: 18 }
    ]
  },
  // T+24s: More progress
  {
    time: 24000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 25 },
      { nodeId: "dept_marketing", status: "running", progress: 35 },
      { nodeId: "dept_sales", status: "running", progress: 22 },
      { nodeId: "dept_operations", status: "running", progress: 30 }
    ]
  },
  // T+27s: Engineering outputs architecture
  {
    time: 27000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 35 },
      { nodeId: "dept_marketing", status: "running", progress: 50 },
      { nodeId: "dept_sales", status: "running", progress: 35 },
      { nodeId: "dept_operations", status: "running", progress: 45 }
    ],
    outputs: [
      createOutput("out_3", "Technical Architecture", "file", "Software Engineering", "dept_engineering", "/mock/architecture.md")
    ]
  },
  // T+30s: More progress
  {
    time: 30000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 45 },
      { nodeId: "dept_marketing", status: "running", progress: 65 },
      { nodeId: "dept_sales", status: "running", progress: 48 },
      { nodeId: "dept_operations", status: "running", progress: 58 }
    ]
  },
  // T+33s: Marketing getting close
  {
    time: 33000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 55 },
      { nodeId: "dept_marketing", status: "running", progress: 80 },
      { nodeId: "dept_sales", status: "running", progress: 60 },
      { nodeId: "dept_operations", status: "running", progress: 70 }
    ],
    outputs: [
      createOutput("out_6", "Brand Guidelines.pdf", "file", "Marketing & Brand", "dept_marketing", "/mock/brand-guidelines.pdf")
    ]
  },
  // T+36s: Marketing completes
  {
    time: 36000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 65 },
      { nodeId: "dept_marketing", status: "completed", progress: 100 },
      { nodeId: "dept_sales", status: "running", progress: 72 },
      { nodeId: "dept_operations", status: "running", progress: 82 }
    ],
    outputs: [
      createOutput("out_7", "Logo Assets", "file", "Marketing & Brand", "dept_marketing", "/mock/logo-assets.zip"),
      createOutput("out_8", "Landing Page Copy", "file", "Marketing & Brand", "dept_marketing", "/mock/landing-copy.md")
    ],
    chatMessage: "Marketing & Brand complete! They've created your brand guidelines, logo assets, and landing page copy."
  },
  // T+39s: Operations almost done
  {
    time: 39000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 72 },
      { nodeId: "dept_sales", status: "running", progress: 82 },
      { nodeId: "dept_operations", status: "running", progress: 92 }
    ]
  },
  // T+42s: Operations completes
  {
    time: 42000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 80 },
      { nodeId: "dept_sales", status: "running", progress: 90 },
      { nodeId: "dept_operations", status: "completed", progress: 100 }
    ],
    outputs: [
      createOutput("out_11", "Operations Manual", "file", "Operations & Finance", "dept_operations", "/mock/ops-manual.pdf"),
      createOutput("out_12", "Legal Documents", "file", "Operations & Finance", "dept_operations", "/mock/legal-docs.zip")
    ],
    chatMessage: "Operations & Finance complete! Your operational processes and legal docs are ready."
  },
  // T+45s: Sales almost done
  {
    time: 45000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 85 },
      { nodeId: "dept_sales", status: "running", progress: 96 }
    ]
  },
  // T+48s: Sales completes
  {
    time: 48000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 92 },
      { nodeId: "dept_sales", status: "completed", progress: 100 }
    ],
    outputs: [
      createOutput("out_9", "Sales Playbook", "file", "Sales & Growth", "dept_sales", "/mock/sales-playbook.pdf"),
      createOutput("out_10", "Pricing Strategy", "file", "Sales & Growth", "dept_sales", "/mock/pricing.pdf")
    ],
    chatMessage: "Sales & Growth complete! Your sales playbook and pricing strategy are ready."
  },
  // T+51s: Engineering almost done
  {
    time: 51000,
    updates: [
      { nodeId: "dept_engineering", status: "running", progress: 97 }
    ]
  },
  // T+55s: Engineering finishes
  {
    time: 55000,
    updates: [
      { nodeId: "dept_engineering", status: "completed", progress: 100 }
    ],
    outputs: [
      createOutput("out_4", "API Documentation", "file", "Software Engineering", "dept_engineering", "/mock/api-docs.md"),
      createOutput("out_5", "GitHub Repository", "link", "Software Engineering", "dept_engineering", "https://github.com/openpreneurship/project-pm")
    ],
    chatMessage: "All departments complete! Your AI-powered company has generated all deliverables. Review the outputs and download your files."
  }
];

// Get workflow state at a specific time
export function getWorkflowStateAtTime(
  baseWorkflow: WorkflowGraph,
  elapsedTime: number
): WorkflowGraph {
  // Start with base workflow
  const nodes = [...baseWorkflow.nodes];

  // Apply all updates up to this time
  for (const step of executionTimeline) {
    if (step.time <= elapsedTime) {
      for (const update of step.updates) {
        const nodeIndex = nodes.findIndex(n => n.id === update.nodeId);
        if (nodeIndex !== -1) {
          nodes[nodeIndex] = {
            ...nodes[nodeIndex],
            status: update.status,
            progress: update.progress
          };
        }
      }
    }
  }

  return {
    ...baseWorkflow,
    nodes
  };
}

// Get outputs at a specific time
export function getOutputsAtTime(elapsedTime: number): ExecutionOutput[] {
  const outputs: ExecutionOutput[] = [];

  for (const step of executionTimeline) {
    if (step.time <= elapsedTime && step.outputs) {
      outputs.push(...step.outputs);
    }
  }

  return outputs;
}

// Get chat messages at a specific time
export function getChatMessagesAtTime(elapsedTime: number): string[] {
  const messages: string[] = [];

  for (const step of executionTimeline) {
    if (step.time <= elapsedTime && step.chatMessage) {
      messages.push(step.chatMessage);
    }
  }

  return messages;
}

// Check if execution is complete
export function isExecutionComplete(elapsedTime: number): boolean {
  const lastStep = executionTimeline[executionTimeline.length - 1];
  return elapsedTime >= lastStep.time;
}

// Get total execution time
export function getTotalExecutionTime(): number {
  return executionTimeline[executionTimeline.length - 1].time;
}
