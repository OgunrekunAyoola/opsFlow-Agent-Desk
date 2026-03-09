import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket';
import TicketReply from '../models/TicketReply';
import ResolvedTicketSnippet from '../models/ResolvedTicketSnippet';
import AiCorrection from '../models/AiCorrection';

dotenv.config();

import KBArticleProposal from '../models/KBArticleProposal';

export class ResolvedTicketEmbeddingService {
  private client: GoogleGenerativeAI | null;
  private embedModel: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
      this.embedModel = (this.client as any).getGenerativeModel({
        model: 'text-embedding-004',
      });
    } else {
      this.client = null;
      this.embedModel = null;
    }
  }

  private async embed(text: string): Promise<number[] | null> {
    if (!this.embedModel) {
      // Mock embedding
      return Array.from({ length: 768 }, () => Math.random());
    }
    if (!text || !text.trim()) return null;
    try {
      const res = await (this.embedModel as any).embedContent({
        content: { parts: [{ text }] },
      });
      const values = res?.embedding?.values;
      if (!Array.isArray(values)) return null;
      return values as number[];
    } catch (e) {
      console.error('Embedding failed (falling back to mock):', e);
      return Array.from({ length: 768 }, () => Math.random());
    }
  }

  async embedText(text: string): Promise<number[] | null> {
    return this.embed(text);
  }

  private async generateCleanQAPair(
    question: string,
    answer: string,
  ): Promise<{ question: string; answer: string; combined: string } | null> {
    if (!this.client) {
      return {
        question: `[Mock] Summary of ${question.substring(0, 20)}...`,
        answer: `[Mock] Resolution steps for ${answer.substring(0, 20)}...`,
        combined: `**Issue:** ${question}\n\n**Resolution:**\n${answer}`,
      };
    }
    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `
        You are an expert support analyst.
        Analyze the following support ticket interaction.
        
        Original Question:
        ${question}

        Final Resolution:
        ${answer}

        Task:
        1. Summarize the core technical issue (User Intent).
        2. Summarize the resolution steps clearly.
        3. Combine them into a clean Q&A format optimized for vector retrieval.
        
        Output Format (JSON):
        {
          "summary_question": "Brief, searchable question representing the issue",
          "clean_resolution": "Step-by-step resolution without conversational filler",
          "keywords": ["tag1", "tag2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Attempt to parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          question: data.summary_question,
          answer: data.clean_resolution,
          combined: `**Issue:** ${data.summary_question}\n\n**Resolution:**\n${data.clean_resolution}`,
        };
      }
      return null;
    } catch (e) {
      console.error('Failed to generate clean QA pair', e);
      return null;
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async findSimilarSnippets(
    tenantId: mongoose.Types.ObjectId,
    embedding: number[],
    limit: number = 5,
  ): Promise<any[]> {
    // Note: For production, use a vector database (Pinecone, Weaviate, or Mongo Atlas Vector Search)
    // This is a simple in-memory implementation for demonstration/MVP scale.
    const candidates = await ResolvedTicketSnippet.find({ tenantId })
      .sort({ createdAt: -1 })
      .limit(100) // Look at last 100 resolved tickets
      .lean()
      .exec();

    const scored = candidates
      .map((c) => ({
        ...c,
        score: this.cosineSimilarity(embedding, c.embedding),
      }))
      .filter((c) => c.score > 0.6) // Lowered threshold for testing
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  private async generateKbProposal(
    snippets: any[],
    tenantId: mongoose.Types.ObjectId,
  ): Promise<void> {
    if (snippets.length < 2) return;

    if (!this.client) {
      // Mock Proposal
      const existing = await KBArticleProposal.findOne({ tenantId, status: 'pending' });
      if (!existing) {
        await KBArticleProposal.create({
          tenantId,
          title: '[Mock Proposal] Common Issue with Refund',
          content: `## Issue\nMany users ask for refunds.\n\n## Resolution\nProcess manually via admin panel.`,
          sourceTicketIds: snippets.map((s) => s.ticketId),
          tags: ['mock', 'refund'],
          confidenceScore: 88,
          status: 'pending',
        });
      }
      return;
    }

    try {
      const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const context = snippets.map((s, i) => `Ticket ${i + 1}:\n${s.snippetText}`).join('\n\n');

      const prompt = `
        You are a Knowledge Manager.
        I have found ${snippets.length} similar resolved tickets.
        
        Context:
        ${context}

        Task:
        1. Identify the common problem and resolution.
        2. Draft a generic Knowledge Base (KB) article that solves this issue for future users.
        3. Assign a confidence score (0-100) based on how consistent the solutions are.

        Output Format (JSON):
        {
          "title": "Clear, searchable title",
          "content": "Full markdown content of the article",
          "tags": ["tag1", "tag2"],
          "confidence": 85
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);

        // Check for duplicate proposals
        const existing = await KBArticleProposal.findOne({
          tenantId,
          title: data.title,
          status: 'pending',
        });

        if (!existing) {
          await KBArticleProposal.create({
            tenantId,
            title: data.title,
            content: data.content,
            sourceTicketIds: snippets.map((s) => s.ticketId),
            tags: data.tags,
            confidenceScore: data.confidence,
            status: 'pending',
          });
        }
      }
    } catch (e) {
      console.error('Failed to generate KB proposal', e);
      // Fallback Mock Proposal
      const existing = await KBArticleProposal.findOne({ tenantId, status: 'pending' });
      if (!existing) {
        await KBArticleProposal.create({
          tenantId,
          title: '[Fallback Mock] Common Password Issue',
          content: `## Issue\nUsers forget passwords.\n\n## Resolution\nUse reset link.`,
          sourceTicketIds: snippets.map((s) => s.ticketId),
          tags: ['mock', 'password'],
          confidenceScore: 80,
          status: 'pending',
        });
      }
    }
  }

  async upsertSnippetForTicket(
    tenantId: mongoose.Types.ObjectId,
    ticketId: mongoose.Types.ObjectId,
  ): Promise<void> {
    // if (!this.embedModel) return;

    const existing = await ResolvedTicketSnippet.findOne({ tenantId, ticketId }).exec();
    if (existing) return;

    const ticket = await Ticket.findOne({ _id: ticketId, tenantId }).exec();
    if (!ticket) return;

    if (!['closed', 'resolved'].includes(ticket.status)) {
      return;
    }

    const correction = await AiCorrection.findOne({ tenantId, ticketId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const replies = await TicketReply.find({
      ticketId,
      tenantId,
      authorType: 'human',
    })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();

    const lastReply = replies[0];

    const originalQuestion = `${ticket.subject || ''}\n${ticket.body || ''}`.trim();
    let finalAnswer: string | undefined;

    if (correction?.finalHumanAnswer) {
      finalAnswer = correction.finalHumanAnswer;
    } else if (lastReply?.body) {
      finalAnswer = lastReply.body;
    }

    if (!finalAnswer) return;

    // Level 4 Upgrade: Use LLM to synthesize a clean Q&A pair
    const cleanQA = await this.generateCleanQAPair(originalQuestion, finalAnswer);

    // Fallback to raw text if LLM fails
    const snippetText = cleanQA ? cleanQA.combined : `${originalQuestion}\n\n${finalAnswer}`;

    if (!snippetText) return;

    const embedding = await this.embed(snippetText);
    if (!embedding || embedding.length === 0) return;

    await ResolvedTicketSnippet.findOneAndUpdate(
      { tenantId, ticketId },
      {
        snippetText,
        embedding,
        intent: cleanQA ? cleanQA.question : ticket.category,
        finalAnswer: cleanQA ? cleanQA.answer : finalAnswer,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    // Level 4: Self-Learning Trigger
    // After embedding, look for patterns to propose new KB articles
    try {
      let similar: any[] = [];
      if (this.embedModel) {
        similar = await this.findSimilarSnippets(tenantId, embedding);
      } else {
        // Mock similar snippets for testing without LLM
        similar = await ResolvedTicketSnippet.find({ tenantId })
          .sort({ createdAt: -1 })
          .limit(3)
          .lean()
          .exec();
      }

      // If we find at least 2 other similar tickets (3 total including current), propose an article
      if (similar.length >= 2) {
        // Include the current one
        const cluster = [{ ticketId, snippetText, embedding }, ...similar];
        await this.generateKbProposal(cluster, tenantId);
      }
    } catch (e) {
      console.error('Self-learning trigger failed', e);
    }
  }
}
