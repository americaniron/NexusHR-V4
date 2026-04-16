import type { ToolAdapter, OAuthCredentials, AdapterResult } from "./types";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const DRIVE_API = "https://www.googleapis.com/drive/v3";

async function googleRequest(
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
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
    return { success: false, error: error.error?.message || `Google API error: ${response.status}` };
  }

  const data = await response.json();
  return { success: true, data };
}

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

export const googleAdapter: ToolAdapter = {
  provider: "Google",

  async execute(
    operation: string,
    parameters: Record<string, unknown>,
    credentials: OAuthCredentials,
  ): Promise<AdapterResult> {
    const token = credentials.accessToken;
    const service = (parameters.service as string) || "gmail";

    switch (operation) {
      case "read":
        return handleRead(service, parameters, token);
      case "write":
        return handleWrite(service, parameters, token);
      case "delete":
        return handleDelete(service, parameters, token);
      default:
        return { success: false, error: `Unsupported Google operation: ${operation}` };
    }
  },

  async refreshToken(credentials: OAuthCredentials): Promise<OAuthCredentials | null> {
    if (!credentials.refreshToken) return null;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    const response = await fetch(GOOGLE_TOKEN_URL, {
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
      refreshToken: credentials.refreshToken,
      tokenType: data.token_type,
      expiresAt: Date.now() + data.expires_in * 1000,
      scope: data.scope,
    };
  },
};

async function handleRead(
  service: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (service) {
    case "gmail": {
      const messageId = parameters.messageId as string | undefined;
      if (messageId) {
        return googleRequest(`${GMAIL_API}/messages/${messageId}?format=full`, token);
      }
      const q = parameters.query as string || "";
      const maxResults = (parameters.limit as number) || 20;
      return googleRequest(
        `${GMAIL_API}/messages?q=${encodeURIComponent(q)}&maxResults=${maxResults}`,
        token,
      );
    }

    case "calendar": {
      const calendarId = (parameters.calendarId as string) || "primary";
      const timeMin = (parameters.timeMin as string) || new Date().toISOString();
      const maxResults = (parameters.limit as number) || 10;
      return googleRequest(
        `${CALENDAR_API}/calendars/${calendarId}/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        token,
      );
    }

    case "drive": {
      const fileId = parameters.fileId as string | undefined;
      if (fileId) {
        return googleRequest(`${DRIVE_API}/files/${fileId}?fields=*`, token);
      }
      const q = parameters.query as string || "";
      const pageSize = (parameters.limit as number) || 20;
      let url = `${DRIVE_API}/files?pageSize=${pageSize}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)`;
      if (q) url += `&q=${encodeURIComponent(q)}`;
      return googleRequest(url, token);
    }

    default:
      return { success: false, error: `Unknown Google service: ${service}` };
  }
}

async function handleWrite(
  service: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (service) {
    case "gmail": {
      const to = parameters.to as string;
      const subject = parameters.subject as string;
      const body = parameters.body as string;
      if (!to || !subject || !body) {
        return { success: false, error: "to, subject, and body are required for sending email" };
      }
      const rawMessage = Buffer.from(
        `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${body}`,
      ).toString("base64url");
      return googleRequest(`${GMAIL_API}/messages/send`, token, {
        method: "POST",
        body: JSON.stringify({ raw: rawMessage }),
      });
    }

    case "calendar": {
      const calendarId = (parameters.calendarId as string) || "primary";
      const summary = parameters.summary as string;
      const start = parameters.start as string;
      const end = parameters.end as string;
      if (!summary || !start || !end) {
        return { success: false, error: "summary, start, and end are required for creating events" };
      }
      return googleRequest(`${CALENDAR_API}/calendars/${calendarId}/events`, token, {
        method: "POST",
        body: JSON.stringify({
          summary,
          description: parameters.description || "",
          start: { dateTime: start, timeZone: (parameters.timeZone as string) || "UTC" },
          end: { dateTime: end, timeZone: (parameters.timeZone as string) || "UTC" },
          attendees: parameters.attendees || [],
        }),
      });
    }

    case "drive": {
      const name = parameters.name as string;
      const mimeType = (parameters.mimeType as string) || "application/vnd.google-apps.document";
      if (!name) {
        return { success: false, error: "name is required for creating files" };
      }
      return googleRequest(`${DRIVE_API}/files`, token, {
        method: "POST",
        body: JSON.stringify({
          name,
          mimeType,
          parents: parameters.folderId ? [parameters.folderId] : undefined,
        }),
      });
    }

    default:
      return { success: false, error: `Unknown Google service: ${service}` };
  }
}

async function handleDelete(
  service: string,
  parameters: Record<string, unknown>,
  token: string,
): Promise<AdapterResult> {
  switch (service) {
    case "gmail": {
      const messageId = parameters.messageId as string;
      if (!messageId) return { success: false, error: "messageId is required" };
      return googleRequest(`${GMAIL_API}/messages/${messageId}/trash`, token, { method: "POST" });
    }

    case "calendar": {
      const calendarId = (parameters.calendarId as string) || "primary";
      const eventId = parameters.eventId as string;
      if (!eventId) return { success: false, error: "eventId is required" };
      const response = await fetch(
        `${CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        return { success: false, error: `Failed to delete event: ${response.status}` };
      }
      return { success: true, data: { deleted: true, eventId } };
    }

    case "drive": {
      const fileId = parameters.fileId as string;
      if (!fileId) return { success: false, error: "fileId is required" };
      const response = await fetch(`${DRIVE_API}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        return { success: false, error: `Failed to delete file: ${response.status}` };
      }
      return { success: true, data: { deleted: true, fileId } };
    }

    default:
      return { success: false, error: `Unknown Google service: ${service}` };
  }
}
