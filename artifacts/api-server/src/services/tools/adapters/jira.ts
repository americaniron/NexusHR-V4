import type { ToolAdapter, OAuthCredentials, AdapterResult } from "./types";

async function jiraRequest(
  url: string,
  token: string,
  options: RequestInit = {},
): Promise<AdapterResult> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    const messages = error.errorMessages?.join(", ") || error.message || `Jira API error: ${response.status}`;
    return { success: false, error: messages };
  }

  if (response.status === 204) {
    return { success: true, data: null };
  }

  const data = await response.json();
  return { success: true, data };
}

const JIRA_TOKEN_URL = "https://auth.atlassian.com/oauth/token";
const JIRA_RESOURCES_URL = "https://api.atlassian.com/oauth/token/accessible-resources";

async function getCloudId(token: string): Promise<string | null> {
  const response = await fetch(JIRA_RESOURCES_URL, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!response.ok) return null;
  const resources = await response.json();
  if (!Array.isArray(resources) || resources.length === 0) return null;
  return resources[0].id;
}

export const jiraAdapter: ToolAdapter = {
  provider: "Jira",

  async execute(
    operation: string,
    parameters: Record<string, unknown>,
    credentials: OAuthCredentials,
  ): Promise<AdapterResult> {
    const token = credentials.accessToken;
    const cloudId = parameters.cloudId as string | undefined;

    if (!cloudId) {
      const resolvedCloudId = await getCloudId(token);
      if (!resolvedCloudId) {
        return { success: false, error: "Unable to resolve Jira Cloud ID. Ensure the app has access to at least one Jira site." };
      }
      parameters = { ...parameters, cloudId: resolvedCloudId };
    }

    const baseUrl = `https://api.atlassian.com/ex/jira/${parameters.cloudId}`;
    const resourceType = (parameters.resourceType as string) || "issues";

    switch (operation) {
      case "read":
        return handleRead(baseUrl, resourceType, parameters, token);
      case "write":
        return handleWrite(baseUrl, resourceType, parameters, token);
      case "delete":
        return handleDelete(baseUrl, resourceType, parameters, token);
      default:
        return { success: false, error: `Unsupported Jira operation: ${operation}` };
    }
  },

  async refreshToken(credentials: OAuthCredentials): Promise<OAuthCredentials | null> {
    if (!credentials.refreshToken) return null;

    const clientId = process.env.JIRA_CLIENT_ID;
    const clientSecret = process.env.JIRA_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const response = await fetch(JIRA_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: credentials.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || credentials.refreshToken,
      tokenType: "Bearer",
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      scope: data.scope,
    };
  },
};

async function handleRead(
  baseUrl: string,
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (resourceType) {
    case "issue":
    case "issues": {
      const issueKey = parameters.issueKey as string | undefined;
      if (issueKey) {
        return jiraRequest(`${baseUrl}/rest/api/3/issue/${issueKey}`, token);
      }
      const jql = (parameters.jql as string) || "order by created DESC";
      const maxResults = (parameters.limit as number) || 20;
      const startAt = (parameters.startAt as number) || 0;
      return jiraRequest(
        `${baseUrl}/rest/api/3/search?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&startAt=${startAt}`,
        token,
      );
    }

    case "project":
    case "projects": {
      const projectKey = parameters.projectKey as string | undefined;
      if (projectKey) {
        return jiraRequest(`${baseUrl}/rest/api/3/project/${projectKey}`, token);
      }
      return jiraRequest(`${baseUrl}/rest/api/3/project/search`, token);
    }

    case "status":
    case "statuses": {
      const projectKey = parameters.projectKey as string;
      if (!projectKey) {
        return { success: false, error: "projectKey is required to list statuses" };
      }
      return jiraRequest(`${baseUrl}/rest/api/3/project/${projectKey}/statuses`, token);
    }

    case "user":
    case "users": {
      return jiraRequest(`${baseUrl}/rest/api/3/users/search?maxResults=${(parameters.limit as number) || 50}`, token);
    }

    default:
      return { success: false, error: `Unknown Jira resource type: ${resourceType}` };
  }
}

async function handleWrite(
  baseUrl: string,
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (resourceType) {
    case "issue":
    case "issues": {
      const issueKey = parameters.issueKey as string | undefined;

      if (issueKey) {
        const fields = parameters.fields as Record<string, unknown> | undefined;
        if (!fields) {
          return { success: false, error: "fields are required for updating an issue" };
        }
        return jiraRequest(`${baseUrl}/rest/api/3/issue/${issueKey}`, token, {
          method: "PUT",
          body: JSON.stringify({ fields }),
        });
      }

      const projectKey = parameters.projectKey as string;
      const summary = parameters.summary as string;
      const issueType = (parameters.issueType as string) || "Task";
      if (!projectKey || !summary) {
        return { success: false, error: "projectKey and summary are required for creating issues" };
      }

      const fields: Record<string, unknown> = {
        project: { key: projectKey },
        summary,
        issuetype: { name: issueType },
      };
      if (parameters.description) {
        fields.description = {
          type: "doc",
          version: 1,
          content: [{
            type: "paragraph",
            content: [{ type: "text", text: parameters.description as string }],
          }],
        };
      }
      if (parameters.assignee) {
        fields.assignee = { accountId: parameters.assignee as string };
      }
      if (parameters.priority) {
        fields.priority = { name: parameters.priority as string };
      }

      return jiraRequest(`${baseUrl}/rest/api/3/issue`, token, {
        method: "POST",
        body: JSON.stringify({ fields }),
      });
    }

    case "comment":
    case "comments": {
      const issueKey = parameters.issueKey as string;
      const body = parameters.body as string;
      if (!issueKey || !body) {
        return { success: false, error: "issueKey and body are required for adding comments" };
      }
      return jiraRequest(`${baseUrl}/rest/api/3/issue/${issueKey}/comment`, token, {
        method: "POST",
        body: JSON.stringify({
          body: {
            type: "doc",
            version: 1,
            content: [{
              type: "paragraph",
              content: [{ type: "text", text: body }],
            }],
          },
        }),
      });
    }

    case "transition":
    case "transitions": {
      const issueKey = parameters.issueKey as string;
      const transitionId = parameters.transitionId as string;
      if (!issueKey || !transitionId) {
        return { success: false, error: "issueKey and transitionId are required for transitions" };
      }
      return jiraRequest(`${baseUrl}/rest/api/3/issue/${issueKey}/transitions`, token, {
        method: "POST",
        body: JSON.stringify({ transition: { id: transitionId } }),
      });
    }

    default:
      return { success: false, error: `Unknown Jira resource type for write: ${resourceType}` };
  }
}

async function handleDelete(
  baseUrl: string,
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (resourceType) {
    case "issue":
    case "issues": {
      const issueKey = parameters.issueKey as string;
      if (!issueKey) return { success: false, error: "issueKey is required" };
      const response = await fetch(`${baseUrl}/rest/api/3/issue/${issueKey}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        return { success: false, error: `Failed to delete issue: ${response.status}` };
      }
      return { success: true, data: { deleted: true, issueKey } };
    }

    default:
      return { success: false, error: `Unknown Jira resource type for delete: ${resourceType}` };
  }
}
