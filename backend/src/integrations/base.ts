import { IIntegrationConnection } from '../models/IntegrationConnection';

export interface IntegrationConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
}

export abstract class IntegrationProvider {
  name: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  authType: 'oauth2' | 'api_key';

  constructor(
    name: string,
    displayName: string,
    description: string,
    authType: 'oauth2' | 'api_key' = 'oauth2',
  ) {
    this.name = name;
    this.displayName = displayName;
    this.description = description;
    this.authType = authType;
  }

  // Returns auth URL for OAuth2 or instructions for API Key
  getAuthUrl(state?: string): string {
    throw new Error('Not implemented');
  }

  // Exchange code for tokens
  exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    profile?: any;
  }> {
    throw new Error('Not implemented');
  }

  // Refresh token logic
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }> {
    throw new Error('Not implemented');
  }

  // Validate API Key (new)
  validateApiKey(key: string): Promise<{
    isValid: boolean;
    profile?: any;
  }> {
    throw new Error('Not implemented');
  }

  // Main sync logic - to be called by worker
  abstract sync(connection: IIntegrationConnection): Promise<void>;

  // Optional: Handle webhooks
  async handleWebhook(payload: any): Promise<void> {
    // Default implementation does nothing
  }
}
