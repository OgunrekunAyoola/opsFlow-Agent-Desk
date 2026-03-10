export interface LLMProvider {
  generateJSON<T = any>(
    task: string,
    prompt: string,
    meta?: { tenantId?: string; ticketId?: string }
  ): Promise<T>;

  generateText(
    task: string,
    prompt: string,
    meta?: { tenantId?: string; ticketId?: string }
  ): Promise<string>;
}
