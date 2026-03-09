import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function main() {
  if (!GEMINI_API_KEY) {
    console.error('No API Key found');
    return;
  }

  const client = new GoogleGenerativeAI(GEMINI_API_KEY);
  // Unfortunately, the Node SDK doesn't expose listModels directly on the client instance easily 
  // in some versions, but let's try via the model manager if available or just a simple fetch.
  
  // Or we can try to use the fetch directly as the error suggested.
  console.log('Using API Key:', GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Hello');
    console.log('Gemini Pro Test:', result.response.text());
  } catch (e) {
    console.error('Gemini Pro Test Failed:', e);
  }

  // Try to use a known embedding model
  try {
    const embedModel = client.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embedModel.embedContent('Hello world');
    console.log('Embedding text-embedding-004 success:', result.embedding.values.slice(0, 5));
  } catch (e: any) {
    console.error('Embedding text-embedding-004 failed:', e.message);
  }
}

main();
