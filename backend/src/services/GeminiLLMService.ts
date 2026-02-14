import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiLLMService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private disabledUntil: number | null = null;

  constructor() {
    if (API_KEY) {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
    } else {
      console.warn('GEMINI_API_KEY is missing. Service will throw error if used.');
    }
  }

  private async generateJSON(prompt: string): Promise<any> {
    if (!this.model) throw new Error('Gemini API Key is not configured.');

    try {
      if (this.disabledUntil && Date.now() < this.disabledUntil) {
        throw new Error('LLM temporarily disabled');
      }
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (error: any) {
      console.error('Gemini generation error:', error);
      const msg = String(error?.message || error);
      const rateLimited = (error?.status === 429) || /quota|rate/i.test(msg);
      if (rateLimited) {
        this.disabledUntil = Date.now() + 5 * 60 * 1000;
      }
      throw error;
    }
  }

  async classifyTicket(
    subject: string,
    body: string,
  ): Promise<{ category: string; reason: string }> {
    const prompt = `
      You are an expert support ticket classifier.
      Analyze the following ticket:
      Subject: "${subject}"
      Body: "${body}"

      Classify it into exactly one of these categories:
      - bug (technical issues, errors)
      - feature_request (new capabilities)
      - billing (invoices, payments)
      - general (questions, how-to)
      - other (spam, irrelevant)

      Return a JSON object with:
      - "category": One of the above strings.
      - "reason": A concise explanation (max 1 sentence).
    `;

    return this.generateJSON(prompt);
  }

  async prioritizeTicket(
    subject: string,
    body: string,
    category: string,
  ): Promise<{ priority: string; reason: string }> {
    const prompt = `
      Analyze this support ticket:
      Subject: "${subject}"
      Body: "${body}"
      Category: "${category}"

      Determine the priority level:
      - urgent (system down, data loss, security)
      - high (core feature broken, blocking workflow)
      - medium (standard issue, annoyance)
      - low (typo, minor ui, nice to have)

      Return a JSON object with:
      - "priority": One of the above strings.
      - "reason": A concise explanation (max 1 sentence).
    `;

    return this.generateJSON(prompt);
  }

  async suggestAssignee(
    subject: string,
    body: string,
    category: string,
    teamMembers: { id: string; name: string; role: string }[],
  ): Promise<{ assigneeId: string | null; reason: string }> {
    const teamContext = teamMembers
      .map((u) => `- ID: ${u.id}, Name: ${u.name}, Role: ${u.role}`)
      .join('\n');

    const prompt = `
      Ticket Context:
      Subject: "${subject}"
      Body: "${body}"
      Category: "${category}"

      Available Team Members:
      ${teamContext}

      Suggest the best assignee based on role and context.
      If no specific match is obvious, pick a general support member or admin.
      If the team list is empty, return null.

      Return a JSON object with:
      - "assigneeId": The ID string of the selected user, or null.
      - "reason": A concise explanation (max 1 sentence).
    `;

    return this.generateJSON(prompt);
  }

  async draftReply(
    subject: string,
    body: string,
    category: string,
    priority: string,
    customerName?: string,
  ): Promise<{ replyBody: string }> {
    const prompt = `
      You are a helpful support agent. Draft a reply to this ticket.
      
      Ticket Details:
      Subject: "${subject}"
      Body: "${body}"
      Category: "${category}"
      Priority: "${priority}"
      Customer Name: "${customerName || 'Customer'}"

      Guidelines:
      - Be polite, professional, and empathetic.
      - Acknowledge the issue based on the category.
      - If it's a bug, ask for reproduction steps if needed.
      - If it's billing, say you'll investigate.
      - Keep it concise (under 150 words).
      - Sign off as "OpsFlow Support Team".

      Return a JSON object with:
      - "replyBody": The full text of the email reply.
    `;

    return this.generateJSON(prompt);
  }
}
