import type { ToolAdapter, OAuthCredentials, AdapterResult } from "./types";

const HUBSPOT_API = "https://api.hubapi.com";

async function hubspotRequest(
  url: string,
  token: string,
  options: RequestInit = {},
): Promise<AdapterResult> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    return { success: false, error: error.message || `HubSpot API error: ${response.status}` };
  }

  const data = await response.json();
  return { success: true, data };
}

const HUBSPOT_TOKEN_URL = "https://api.hubapi.com/oauth/v1/token";

export const hubspotAdapter: ToolAdapter = {
  provider: "HubSpot",

  async execute(
    operation: string,
    parameters: Record<string, unknown>,
    credentials: OAuthCredentials,
  ): Promise<AdapterResult> {
    const token = credentials.accessToken;
    const resourceType = (parameters.resourceType as string) || "contacts";

    switch (operation) {
      case "read":
        return handleRead(resourceType, parameters, token);
      case "write":
        return handleWrite(resourceType, parameters, token);
      case "delete":
        return handleDelete(resourceType, parameters, token);
      default:
        return { success: false, error: `Unsupported HubSpot operation: ${operation}` };
    }
  },

  async refreshToken(credentials: OAuthCredentials): Promise<OAuthCredentials | null> {
    if (!credentials.refreshToken) return null;

    const clientId = process.env.HUBSPOT_CLIENT_ID;
    const clientSecret = process.env.HUBSPOT_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const response = await fetch(HUBSPOT_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
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
    };
  },
};

async function handleRead(
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  const limit = (parameters.limit as number) || 10;

  switch (resourceType) {
    case "contact":
    case "contacts": {
      const contactId = parameters.contactId as string | undefined;
      if (contactId) {
        return hubspotRequest(
          `${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}`,
          token,
        );
      }
      let url = `${HUBSPOT_API}/crm/v3/objects/contacts?limit=${limit}`;
      if (parameters.properties) {
        url += `&properties=${encodeURIComponent(String(parameters.properties))}`;
      }
      if (parameters.after) {
        url += `&after=${encodeURIComponent(String(parameters.after))}`;
      }
      return hubspotRequest(url, token);
    }

    case "deal":
    case "deals": {
      const dealId = parameters.dealId as string | undefined;
      if (dealId) {
        return hubspotRequest(
          `${HUBSPOT_API}/crm/v3/objects/deals/${dealId}`,
          token,
        );
      }
      let url = `${HUBSPOT_API}/crm/v3/objects/deals?limit=${limit}`;
      if (parameters.properties) {
        url += `&properties=${encodeURIComponent(String(parameters.properties))}`;
      }
      if (parameters.after) {
        url += `&after=${encodeURIComponent(String(parameters.after))}`;
      }
      return hubspotRequest(url, token);
    }

    case "company":
    case "companies": {
      const companyId = parameters.companyId as string | undefined;
      if (companyId) {
        return hubspotRequest(
          `${HUBSPOT_API}/crm/v3/objects/companies/${companyId}`,
          token,
        );
      }
      let url = `${HUBSPOT_API}/crm/v3/objects/companies?limit=${limit}`;
      if (parameters.properties) {
        url += `&properties=${encodeURIComponent(String(parameters.properties))}`;
      }
      return hubspotRequest(url, token);
    }

    default:
      return { success: false, error: `Unknown HubSpot resource type: ${resourceType}` };
  }
}

async function handleWrite(
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (resourceType) {
    case "contact":
    case "contacts": {
      const properties = parameters.properties as Record<string, string> | undefined;
      if (!properties || (!properties.email && !properties.firstname && !properties.lastname)) {
        return { success: false, error: "properties with at least email, firstname, or lastname required for creating contacts" };
      }
      const contactId = parameters.contactId as string | undefined;
      if (contactId) {
        return hubspotRequest(
          `${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}`,
          token,
          { method: "PATCH", body: JSON.stringify({ properties }) },
        );
      }
      return hubspotRequest(
        `${HUBSPOT_API}/crm/v3/objects/contacts`,
        token,
        { method: "POST", body: JSON.stringify({ properties }) },
      );
    }

    case "deal":
    case "deals": {
      const properties = parameters.properties as Record<string, string> | undefined;
      if (!properties || !properties.dealname) {
        return { success: false, error: "properties with dealname required for creating deals" };
      }
      const dealId = parameters.dealId as string | undefined;
      if (dealId) {
        return hubspotRequest(
          `${HUBSPOT_API}/crm/v3/objects/deals/${dealId}`,
          token,
          { method: "PATCH", body: JSON.stringify({ properties }) },
        );
      }
      return hubspotRequest(
        `${HUBSPOT_API}/crm/v3/objects/deals`,
        token,
        { method: "POST", body: JSON.stringify({ properties }) },
      );
    }

    default:
      return { success: false, error: `Unknown HubSpot resource type for write: ${resourceType}` };
  }
}

async function handleDelete(
  resourceType: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (resourceType) {
    case "contact":
    case "contacts": {
      const contactId = parameters.contactId as string;
      if (!contactId) return { success: false, error: "contactId is required" };
      const response = await fetch(
        `${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        return { success: false, error: `Failed to delete contact: ${response.status}` };
      }
      return { success: true, data: { deleted: true, contactId } };
    }

    case "deal":
    case "deals": {
      const dealId = parameters.dealId as string;
      if (!dealId) return { success: false, error: "dealId is required" };
      const response = await fetch(
        `${HUBSPOT_API}/crm/v3/objects/deals/${dealId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        return { success: false, error: `Failed to delete deal: ${response.status}` };
      }
      return { success: true, data: { deleted: true, dealId } };
    }

    default:
      return { success: false, error: `Unknown HubSpot resource type for delete: ${resourceType}` };
  }
}
