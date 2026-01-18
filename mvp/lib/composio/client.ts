// Composio MCP client - connects to Composio MCP server
// Provides direct access to Notion and Gmail tools via MCP

import { createMCPClient } from "@ai-sdk/mcp";

const COMPOSIO_MCP_URL = "https://backend.composio.dev/v3/mcp/63ee1e09-9ae8-451f-a170-a0b153b2f7c6/mcp?user_id=pg-test-8373f14d-2ffa-4acb-aa09-edb62ebb88f9";

// Create MCP client connected to Composio
export async function getComposioMCPClient() {
  const apiKey = process.env.COMPOSIO_API_KEY || process.env.NOTION_API_KEY;
  
  const client = await createMCPClient({
    transport: {
      type: "http",
      url: COMPOSIO_MCP_URL,
      headers: apiKey ? { "x-api-key": apiKey } : undefined,
    },
  });
  
  return client;
}

// Get all tools from Composio MCP (Notion, Gmail)
export async function getComposioTools() {
  const client = await getComposioMCPClient();
  const tools = await client.tools();
  return { tools, client };
}
