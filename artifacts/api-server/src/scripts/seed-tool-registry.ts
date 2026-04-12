import { db } from "@workspace/db";
import { toolRegistry, toolRoles } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const TOOLS = [
  {
    name: "google-workspace",
    displayName: "Google Workspace",
    description: "Gmail, Drive, Sheets, Calendar, and Docs integration for productivity and collaboration",
    category: "productivity",
    provider: "Google",
    authType: "oauth2",
    requiredScopes: [
      "gmail.readonly", "gmail.send", "gmail.modify",
      "drive.readonly", "drive.file",
      "spreadsheets", "spreadsheets.readonly",
      "calendar", "calendar.events",
      "documents", "documents.readonly"
    ],
    capabilities: ["read", "write", "delete", "stream"],
    rateLimits: { requestsPerMinute: 60, requestsPerDay: 10000, burstLimit: 10 },
    healthEndpoint: "https://www.googleapis.com/discovery/v1/apis",
    documentationUrl: "https://developers.google.com/workspace",
  },
  {
    name: "microsoft-365",
    displayName: "Microsoft 365",
    description: "Outlook, OneDrive, Teams, and Excel integration for enterprise productivity",
    category: "productivity",
    provider: "Microsoft",
    authType: "oauth2",
    requiredScopes: [
      "Mail.Read", "Mail.Send", "Mail.ReadWrite",
      "Files.Read", "Files.ReadWrite",
      "Chat.Read", "Chat.ReadWrite", "ChannelMessage.Send",
      "ExcelDocument.ReadWrite"
    ],
    capabilities: ["read", "write", "delete", "stream"],
    rateLimits: { requestsPerMinute: 120, requestsPerDay: 20000, burstLimit: 20 },
    healthEndpoint: "https://graph.microsoft.com/v1.0/$metadata",
    documentationUrl: "https://learn.microsoft.com/en-us/graph/",
  },
  {
    name: "slack",
    displayName: "Slack",
    description: "Messaging, file sharing, and workflow automation for team communication",
    category: "communication",
    provider: "Slack",
    authType: "oauth2",
    requiredScopes: [
      "chat:write", "chat:read",
      "channels:read", "channels:history",
      "files:read", "files:write",
      "workflows:read", "workflows:write"
    ],
    capabilities: ["read", "write", "delete", "stream"],
    rateLimits: { requestsPerMinute: 50, requestsPerDay: 15000, burstLimit: 5 },
    healthEndpoint: "https://slack.com/api/api.test",
    documentationUrl: "https://api.slack.com/",
  },
  {
    name: "hubspot",
    displayName: "HubSpot",
    description: "CRM, marketing automation, and sales pipeline management",
    category: "crm",
    provider: "HubSpot",
    authType: "oauth2",
    requiredScopes: [
      "crm.objects.contacts.read", "crm.objects.contacts.write",
      "crm.objects.deals.read", "crm.objects.deals.write",
      "crm.objects.companies.read", "crm.objects.companies.write",
      "content", "marketing-email"
    ],
    capabilities: ["read", "write", "delete"],
    rateLimits: { requestsPerMinute: 100, requestsPerDay: 25000, burstLimit: 15 },
    healthEndpoint: "https://api.hubapi.com/integrations/v1/me",
    documentationUrl: "https://developers.hubspot.com/docs/api/overview",
  },
  {
    name: "salesforce",
    displayName: "Salesforce",
    description: "CRM and Service Cloud for customer relationship management and support",
    category: "crm",
    provider: "Salesforce",
    authType: "oauth2",
    requiredScopes: [
      "api", "refresh_token", "full",
      "chatter_api", "wave_api"
    ],
    capabilities: ["read", "write", "delete"],
    rateLimits: { requestsPerMinute: 100, requestsPerDay: 15000, burstLimit: 25 },
    healthEndpoint: "/services/data/v59.0/limits",
    documentationUrl: "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/",
  },
  {
    name: "zendesk",
    displayName: "Zendesk",
    description: "Customer support ticketing and knowledge base management",
    category: "support",
    provider: "Zendesk",
    authType: "oauth2",
    requiredScopes: [
      "tickets:read", "tickets:write",
      "users:read", "users:write",
      "hc:read", "hc:write"
    ],
    capabilities: ["read", "write", "delete"],
    rateLimits: { requestsPerMinute: 200, requestsPerDay: 40000, burstLimit: 10 },
    healthEndpoint: "/api/v2/account/settings.json",
    documentationUrl: "https://developer.zendesk.com/api-reference/",
  },
  {
    name: "quickbooks",
    displayName: "QuickBooks",
    description: "Accounting, invoicing, and financial management",
    category: "finance",
    provider: "Intuit",
    authType: "oauth2",
    requiredScopes: [
      "com.intuit.quickbooks.accounting",
      "com.intuit.quickbooks.payment"
    ],
    capabilities: ["read", "write"],
    rateLimits: { requestsPerMinute: 40, requestsPerDay: 5000, burstLimit: 5 },
    healthEndpoint: "/v3/company/healthcheck",
    documentationUrl: "https://developer.intuit.com/app/developer/qbo/docs/get-started",
  },
  {
    name: "stripe",
    displayName: "Stripe",
    description: "Payment processing, billing, and subscription management",
    category: "finance",
    provider: "Stripe",
    authType: "api_key",
    requiredScopes: [
      "charges:read", "charges:write",
      "customers:read", "customers:write",
      "subscriptions:read", "subscriptions:write",
      "invoices:read", "invoices:write"
    ],
    capabilities: ["read", "write"],
    rateLimits: { requestsPerMinute: 100, requestsPerDay: 10000, burstLimit: 25 },
    healthEndpoint: "https://api.stripe.com/v1/balance",
    documentationUrl: "https://stripe.com/docs/api",
  },
  {
    name: "notion",
    displayName: "Notion",
    description: "Database management, wikis, and collaborative documentation",
    category: "productivity",
    provider: "Notion",
    authType: "oauth2",
    requiredScopes: [
      "read_content", "update_content",
      "insert_content", "read_user_info"
    ],
    capabilities: ["read", "write", "delete"],
    rateLimits: { requestsPerMinute: 3, requestsPerDay: 2000, burstLimit: 3 },
    healthEndpoint: "https://api.notion.com/v1/users/me",
    documentationUrl: "https://developers.notion.com/",
  },
  {
    name: "asana",
    displayName: "Asana",
    description: "Project management, task tracking, and team coordination",
    category: "project-management",
    provider: "Asana",
    authType: "oauth2",
    requiredScopes: ["default"],
    capabilities: ["read", "write", "delete"],
    rateLimits: { requestsPerMinute: 150, requestsPerDay: 50000, burstLimit: 50 },
    healthEndpoint: "https://app.asana.com/api/1.0/users/me",
    documentationUrl: "https://developers.asana.com/docs",
  },
];

const SYSTEM_ROLES = [
  {
    name: "admin",
    displayName: "Admin",
    description: "Full access to all tools and operations including delete and configuration",
    permissions: [
      { tool: "*", operations: ["read", "write", "delete", "stream", "configure"], resources: "*" }
    ],
  },
  {
    name: "manager",
    displayName: "Manager",
    description: "Read/write access to all tools, no delete or configure",
    permissions: [
      { tool: "*", operations: ["read", "write", "stream"], resources: "*" }
    ],
  },
  {
    name: "operator",
    displayName: "Operator",
    description: "Read/write access to assigned tools with operational scope",
    permissions: [
      { tool: "slack", operations: ["read", "write"], resources: "*" },
      { tool: "asana", operations: ["read", "write"], resources: "*" },
      { tool: "notion", operations: ["read", "write"], resources: "*" },
      { tool: "google-workspace", operations: ["read", "write"], resources: "assigned" },
      { tool: "microsoft-365", operations: ["read", "write"], resources: "assigned" },
    ],
  },
  {
    name: "data-analyst",
    displayName: "Data Analyst",
    description: "Read-only access to data sources for analysis and reporting",
    permissions: [
      { tool: "*", operations: ["read"], resources: "*" }
    ],
  },
  {
    name: "finance",
    displayName: "Finance",
    description: "Full access to financial tools, read-only to others",
    permissions: [
      { tool: "quickbooks", operations: ["read", "write"], resources: "*" },
      { tool: "stripe", operations: ["read", "write"], resources: "*" },
      { tool: "hubspot", operations: ["read"], resources: "deals,invoices" },
      { tool: "salesforce", operations: ["read"], resources: "opportunities,quotes" },
    ],
  },
  {
    name: "support",
    displayName: "Support",
    description: "Full access to support tools, read-only to CRM",
    permissions: [
      { tool: "zendesk", operations: ["read", "write"], resources: "*" },
      { tool: "slack", operations: ["read", "write"], resources: "*" },
      { tool: "hubspot", operations: ["read"], resources: "contacts,tickets" },
      { tool: "salesforce", operations: ["read"], resources: "cases,contacts" },
    ],
  },
];

async function seed() {
  console.log("Seeding tool registry...");

  for (const tool of TOOLS) {
    const existing = await db.select().from(toolRegistry).where(eq(toolRegistry.name, tool.name));

    if (existing.length > 0) {
      await db.update(toolRegistry).set({
        displayName: tool.displayName,
        description: tool.description,
        category: tool.category,
        provider: tool.provider,
        authType: tool.authType,
        requiredScopes: tool.requiredScopes,
        capabilities: tool.capabilities,
        rateLimits: tool.rateLimits,
        healthEndpoint: tool.healthEndpoint,
        documentationUrl: tool.documentationUrl,
        isActive: 1,
        updatedAt: new Date(),
      }).where(eq(toolRegistry.name, tool.name));
      console.log(`  Updated: ${tool.displayName}`);
    } else {
      await db.insert(toolRegistry).values({ ...tool, isActive: 1 });
      console.log(`  Inserted: ${tool.displayName}`);
    }
  }

  console.log("\nSeeding tool roles...");

  for (const role of SYSTEM_ROLES) {
    const existing = await db.select().from(toolRoles).where(eq(toolRoles.name, role.name));

    if (existing.length > 0) {
      await db.update(toolRoles).set({
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        isSystem: true,
        updatedAt: new Date(),
      }).where(eq(toolRoles.name, role.name));
      console.log(`  Updated role: ${role.displayName}`);
    } else {
      await db.insert(toolRoles).values({
        name: role.name,
        displayName: role.displayName,
        description: role.description,
        permissions: role.permissions,
        isSystem: true,
      });
      console.log(`  Inserted role: ${role.displayName}`);
    }
  }

  console.log("\nTool registry seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
