import type { ToolAdapter, OAuthCredentials, AdapterResult } from "./types";

const GITHUB_API = "https://api.github.com";

async function githubRequest(
  url: string,
  token: string,
  options: RequestInit = {},
): Promise<AdapterResult> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    return { success: false, error: error.message || `GitHub API error: ${response.status}` };
  }

  if (response.status === 204) {
    return { success: true, data: null };
  }

  const data = await response.json();
  return { success: true, data };
}

const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export const githubAdapter: ToolAdapter = {
  provider: "GitHub",

  async execute(
    operation: string,
    parameters: Record<string, unknown>,
    credentials: OAuthCredentials,
  ): Promise<AdapterResult> {
    const token = credentials.accessToken;
    const resourceType = (parameters.resourceType as string) || "repos";

    switch (operation) {
      case "read":
        return handleRead(resourceType, parameters, token);
      case "write":
        return handleWrite(resourceType, parameters, token);
      case "delete":
        return handleDelete(resourceType, parameters, token);
      default:
        return { success: false, error: `Unsupported GitHub operation: ${operation}` };
    }
  },

  async refreshToken(credentials: OAuthCredentials): Promise<OAuthCredentials | null> {
    if (!credentials.refreshToken) return null;

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const response = await fetch(GITHUB_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: credentials.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    if (data.error) return null;
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || credentials.refreshToken,
      tokenType: data.token_type || "Bearer",
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
      scope: data.scope,
    };
  },
};

async function handleRead(
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  const owner = parameters.owner as string | undefined;
  const repo = parameters.repo as string | undefined;
  const perPage = (parameters.limit as number) || 30;
  const page = (parameters.page as number) || 1;

  switch (resourceType) {
    case "repo":
    case "repos": {
      if (owner && repo) {
        return githubRequest(`${GITHUB_API}/repos/${owner}/${repo}`, token);
      }
      if (owner) {
        return githubRequest(
          `${GITHUB_API}/users/${owner}/repos?per_page=${perPage}&page=${page}&sort=updated`,
          token,
        );
      }
      return githubRequest(
        `${GITHUB_API}/user/repos?per_page=${perPage}&page=${page}&sort=updated`,
        token,
      );
    }

    case "issue":
    case "issues": {
      if (!owner || !repo) {
        return { success: false, error: "owner and repo are required for reading issues" };
      }
      const issueNumber = parameters.issueNumber as number | undefined;
      if (issueNumber) {
        return githubRequest(`${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`, token);
      }
      const state = (parameters.state as string) || "open";
      let url = `${GITHUB_API}/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&page=${page}`;
      if (parameters.labels) {
        url += `&labels=${encodeURIComponent(String(parameters.labels))}`;
      }
      if (parameters.assignee) {
        url += `&assignee=${encodeURIComponent(String(parameters.assignee))}`;
      }
      return githubRequest(url, token);
    }

    case "pull":
    case "pulls":
    case "pr":
    case "prs": {
      if (!owner || !repo) {
        return { success: false, error: "owner and repo are required for reading pull requests" };
      }
      const prNumber = parameters.prNumber as number | undefined;
      if (prNumber) {
        return githubRequest(`${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`, token);
      }
      const state = (parameters.state as string) || "open";
      return githubRequest(
        `${GITHUB_API}/repos/${owner}/${repo}/pulls?state=${state}&per_page=${perPage}&page=${page}`,
        token,
      );
    }

    case "user": {
      const username = parameters.username as string | undefined;
      if (username) {
        return githubRequest(`${GITHUB_API}/users/${username}`, token);
      }
      return githubRequest(`${GITHUB_API}/user`, token);
    }

    default:
      return { success: false, error: `Unknown GitHub resource type: ${resourceType}` };
  }
}

async function handleWrite(
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  const owner = parameters.owner as string;
  const repo = parameters.repo as string;

  switch (resourceType) {
    case "issue":
    case "issues": {
      if (!owner || !repo) {
        return { success: false, error: "owner and repo are required" };
      }

      const issueNumber = parameters.issueNumber as number | undefined;
      if (issueNumber) {
        const updates: Record<string, unknown> = {};
        if (parameters.title) updates.title = parameters.title;
        if (parameters.body) updates.body = parameters.body;
        if (parameters.state) updates.state = parameters.state;
        if (parameters.labels) updates.labels = parameters.labels;
        if (parameters.assignees) updates.assignees = parameters.assignees;
        return githubRequest(
          `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}`,
          token,
          { method: "PATCH", body: JSON.stringify(updates) },
        );
      }

      const title = parameters.title as string;
      if (!title) {
        return { success: false, error: "title is required for creating issues" };
      }
      const issueBody: Record<string, unknown> = { title };
      if (parameters.body) issueBody.body = parameters.body;
      if (parameters.labels) issueBody.labels = parameters.labels;
      if (parameters.assignees) issueBody.assignees = parameters.assignees;
      return githubRequest(
        `${GITHUB_API}/repos/${owner}/${repo}/issues`,
        token,
        { method: "POST", body: JSON.stringify(issueBody) },
      );
    }

    case "pull":
    case "pulls":
    case "pr":
    case "prs": {
      if (!owner || !repo) {
        return { success: false, error: "owner and repo are required" };
      }

      const prNumber = parameters.prNumber as number | undefined;
      if (prNumber) {
        const updates: Record<string, unknown> = {};
        if (parameters.title) updates.title = parameters.title;
        if (parameters.body) updates.body = parameters.body;
        if (parameters.state) updates.state = parameters.state;
        return githubRequest(
          `${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`,
          token,
          { method: "PATCH", body: JSON.stringify(updates) },
        );
      }

      const title = parameters.title as string;
      const head = parameters.head as string;
      const base = parameters.base as string;
      if (!title || !head || !base) {
        return { success: false, error: "title, head, and base are required for creating pull requests" };
      }
      const prBody: Record<string, unknown> = { title, head, base };
      if (parameters.body) prBody.body = parameters.body;
      if (parameters.draft !== undefined) prBody.draft = parameters.draft;
      return githubRequest(
        `${GITHUB_API}/repos/${owner}/${repo}/pulls`,
        token,
        { method: "POST", body: JSON.stringify(prBody) },
      );
    }

    case "comment":
    case "comments": {
      if (!owner || !repo) {
        return { success: false, error: "owner and repo are required" };
      }
      const issueNumber = parameters.issueNumber as number;
      const body = parameters.body as string;
      if (!issueNumber || !body) {
        return { success: false, error: "issueNumber and body are required for adding comments" };
      }
      return githubRequest(
        `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
        token,
        { method: "POST", body: JSON.stringify({ body }) },
      );
    }

    default:
      return { success: false, error: `Unknown GitHub resource type for write: ${resourceType}` };
  }
}

async function handleDelete(
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  const owner = parameters.owner as string;
  const repo = parameters.repo as string;

  switch (resourceType) {
    case "comment":
    case "comments": {
      if (!owner || !repo) {
        return { success: false, error: "owner and repo are required" };
      }
      const commentId = parameters.commentId as number;
      if (!commentId) return { success: false, error: "commentId is required" };
      const response = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/issues/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        },
      );
      if (!response.ok) {
        return { success: false, error: `Failed to delete comment: ${response.status}` };
      }
      return { success: true, data: { deleted: true, commentId } };
    }

    default:
      return { success: false, error: `Unknown GitHub resource type for delete: ${resourceType}` };
  }
}
