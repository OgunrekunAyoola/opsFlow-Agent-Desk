import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import VectorDoc from '../models/VectorDoc';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export class RAGService {
  private client: GoogleGenerativeAI | null;
  private embedModel: any;

  constructor() {
    if (GEMINI_API_KEY) {
      this.client = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.embedModel = (this.client as any).getGenerativeModel({
        model: 'models/gemini-embedding-001',
      });
    } else {
      this.client = null;
      this.embedModel = null;
    }
  }

  async embed(text: string): Promise<number[] | null> {
    if (!this.embedModel || !text || !text.trim()) return null;
    try {
      const res = await (this.embedModel as any).embedContent({
        content: { parts: [{ text }] },
      });
      const values = res?.embedding?.values;
      if (!Array.isArray(values)) return null;
      return values as number[];
    } catch (err) {
      console.error('RAGService embedding error:', err);
      return null;
    }
  }

  async upsertDoc(
    tenantId: mongoose.Types.ObjectId,
    sourceType: 'ticket' | 'doc' | 'web' | 'integration',
    sourceId: string,
    content: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    if (!content) return;

    const embedding = await this.embed(content);
    if (!embedding || embedding.length === 0) return;

    await VectorDoc.findOneAndUpdate(
      { tenantId, sourceType, sourceId },
      {
        content,
        metadata,
        embedding,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );
  }

  async search(
    tenantId: mongoose.Types.ObjectId,
    query: string,
    limit: number = 5,
  ): Promise<any[]> {
    const embedding = await this.embed(query);
    if (!embedding) return [];

    const results = await VectorDoc.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index', // Ensure this index exists in MongoDB Atlas
          path: 'embedding',
          queryVector: embedding,
          numCandidates: limit * 10,
          limit: limit,
        },
      },
      {
        $match: {
          tenantId: tenantId,
        },
      },
      {
        $project: {
          _id: 0,
          sourceId: 1,
          sourceType: 1,
          content: 1,
          metadata: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    return results;
  }
}
