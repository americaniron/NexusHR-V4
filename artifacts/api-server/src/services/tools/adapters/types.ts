export interface OAuthCredentials {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: number;
  scope?: string;
}

export interface AdapterResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolAdapter {
  readonly provider: string;
  execute(
    operation: string,
    parameters: Record<string, unknown>,
    credentials: OAuthCredentials,
  ): Promise<AdapterResult>;
  refreshToken?(credentials: OAuthCredentials): Promise<OAuthCredentials | null>;
}
