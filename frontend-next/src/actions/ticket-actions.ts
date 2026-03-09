'use server';

import { grpcRequest } from '@/lib/grpc-client';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  body: string;
  createdAt: string;
  aiDraftText?: string;
  aiConfidence?: number;
  aiSuggestedCategory?: string;
}

export async function replyTicketAction(
  id: string,
  tenantId: string,
  body: string,
  userId: string,
) {
  const requestId = uuidv4();
  try {
    const response = await grpcRequest<Ticket>(
      'ReplyTicket',
      {
        id,
        tenantId,
        body,
        userId,
      },
      { 'x-request-id': requestId },
    );
    revalidatePath('/tickets');
    return { success: true, data: response };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function listTicketsAction(tenantId: string, status?: string) {
  const requestId = uuidv4();
  try {
    const response = await grpcRequest<{ tickets: Ticket[]; total: number }>(
      'ListTickets',
      {
        tenantId,
        page: 1,
        limit: 50,
        status,
      },
      { 'x-request-id': requestId },
    );
    return { success: true, data: response };
  } catch (error: unknown) {
    console.error('ListTickets Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function createTicketAction(formData: FormData) {
  const requestId = uuidv4();
  const subject = formData.get('subject') as string;
  const body = formData.get('body') as string;
  const tenantId = formData.get('tenantId') as string;

  try {
    const response = await grpcRequest<Ticket>(
      'CreateTicket',
      {
        subject,
        body,
        tenantId,
      },
      { 'x-request-id': requestId },
    );

    revalidatePath('/tickets');
    return { success: true, data: response };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function searchTicketsAction(tenantId: string, query: string) {
  const requestId = uuidv4();
  try {
    const response = await grpcRequest<{ tickets: Ticket[]; total: number }>(
      'SearchTickets',
      {
        tenantId,
        query,
        limit: 10,
      },
      { 'x-request-id': requestId },
    );
    return { success: true, data: response };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function updateTicketAction(
  id: string,
  tenantId: string,
  updates: { status?: string; priority?: string },
) {
  const requestId = uuidv4();
  try {
    const response = await grpcRequest<Ticket>(
      'UpdateTicket',
      {
        id,
        tenantId,
        ...updates,
      },
      { 'x-request-id': requestId },
    );

    revalidatePath('/tickets');
    return { success: true, data: response };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

export async function triageTicketAction(id: string, tenantId: string, userId: string) {
  const requestId = uuidv4();
  try {
    const response = await grpcRequest<{ status: string; message: string }>(
      'TriageTicket',
      {
        id,
        tenantId,
        userId,
      },
      { 'x-request-id': requestId },
    );

    revalidatePath('/tickets');
    return { success: true, data: response };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
