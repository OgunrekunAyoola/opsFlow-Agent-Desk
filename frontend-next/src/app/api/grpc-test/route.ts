import { NextRequest, NextResponse } from 'next/server';
import { grpcRequest } from '@/lib/grpc-client';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const tenantId = searchParams.get('tenantId');
  const requestId = req.headers.get('x-request-id') || uuidv4();

  if (!id || !tenantId) {
    return NextResponse.json({ error: 'Missing id or tenantId' }, { status: 400 });
  }

  try {
    console.log(`[Frontend] Calling gRPC GetTicket for ${id} (Request ID: ${requestId})`);

    const ticket = await grpcRequest<unknown>(
      'GetTicket',
      { id, tenantId },
      { 'x-request-id': requestId },
    );

    return NextResponse.json({
      source: 'gRPC',
      requestId,
      data: ticket,
    });
  } catch (error: unknown) {
    console.error('[Frontend] gRPC Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'gRPC Call Failed';
    return NextResponse.json(
      {
        error: errorMessage,
        details: (error as any)?.details,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const requestId = req.headers.get('x-request-id') || uuidv4();

  try {
    console.log(`[Frontend] Calling gRPC CreateTicket (Request ID: ${requestId})`);

    const ticket = await grpcRequest<unknown>(
      'CreateTicket',
      {
        subject: body.subject,
        body: body.body,
        tenantId: body.tenantId,
      },
      { 'x-request-id': requestId },
    );

    return NextResponse.json({
      source: 'gRPC',
      requestId,
      data: ticket,
    });
  } catch (error: unknown) {
    console.error('[Frontend] gRPC Create Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'gRPC Create Failed';
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
