const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001';

type Method = 'GET' | 'POST' | 'PATCH';

type EndpointExpectation = {
  name: string;
  method: Method;
  path: string;
  requiresAuth: boolean;
  description: string;
  body?: Record<string, unknown>;
  tolerateStatus?: number[];
  expectedErrorContains?: string;
};

type EndpointResult = {
  name: string;
  method: Method;
  path: string;
  ok: boolean;
  status: number;
  error?: string;
};

async function request(
  method: Method,
  path: string,
  body?: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<{ status: number; ok: boolean; bodyText: string }> {
  const isAbsolute = path.startsWith('http://') || path.startsWith('https://');
  const url = isAbsolute ? path : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const initHeaders = new Headers(headers);
  let payload: BodyInit | undefined;
  if (body !== undefined) {
    payload = JSON.stringify(body);
    if (!initHeaders.has('Content-Type')) {
      initHeaders.set('Content-Type', 'application/json');
    }
  }
  const res = await fetch(url, {
    method,
    headers: initHeaders,
    body: payload,
    credentials: 'include',
  });
  const text = await res.text();
  return { status: res.status, ok: res.ok, bodyText: text };
}

const endpoints: EndpointExpectation[] = [
  {
    name: 'Health',
    method: 'GET',
    path: '/health',
    requiresAuth: false,
    description: 'Backend health check',
  },
  {
    name: 'Dashboard stats (auth required)',
    method: 'GET',
    path: '/dashboard/stats',
    requiresAuth: true,
    description: 'Main dashboard statistics',
  },
  {
    name: 'Dashboard metrics (auth required)',
    method: 'GET',
    path: '/dashboard/metrics',
    requiresAuth: true,
    description: 'Dashboard metrics chart data',
  },
  {
    name: 'Tickets list (auth required)',
    method: 'GET',
    path: '/tickets',
    requiresAuth: true,
    description: 'Ticket list backing /tickets page',
  },
  {
    name: 'Ticket detail (auth required, example id placeholder)',
    method: 'GET',
    path: '/tickets/:id',
    requiresAuth: true,
    description:
      'Ticket detail backing /tickets/[id] page. Replace :id with a real ticket id when running manually.',
  },
  {
    name: 'Ticket triage workflow (auth required, example id placeholder)',
    method: 'POST',
    path: '/tickets/:id/workflows/triage',
    requiresAuth: true,
    description: 'AI triage workflow. Replace :id with a real ticket id when running manually.',
  },
  {
    name: 'Ticket reply (auth required, example id placeholder)',
    method: 'POST',
    path: '/tickets/:id/reply',
    requiresAuth: true,
    description: 'Reply to ticket using body payload. Replace :id with a real ticket id.',
    body: { body: 'Test reply from endpoint-tests.ts', useAiDraft: false },
  },
  {
    name: 'Ticket ingest (public key-based)',
    method: 'POST',
    path: '/tickets/ingest',
    requiresAuth: false,
    description:
      'Generic ingestion API described in docs. Requires x-opsflow-key header for success.',
    body: {
      subject: 'Test ticket from endpoint-tests.ts',
      body: 'This is a test ticket created by the automated endpoint test script.',
      channel: 'chat',
      customerName: 'Endpoint Test',
      customerEmail: 'endpoint-test@example.com',
      externalId: `endpoint-test-${Date.now()}`,
    },
    tolerateStatus: [401],
    expectedErrorContains: 'missing_api_key',
  },
  {
    name: 'Clients list (auth + admin required)',
    method: 'GET',
    path: '/clients',
    requiresAuth: true,
    description: 'Client list backing /clients page. Admin-only.',
  },
  {
    name: 'Knowledge base list (auth required)',
    method: 'GET',
    path: '/kb',
    requiresAuth: true,
    description: 'Knowledge base list backing /kb page.',
  },
  {
    name: 'Settings ingest API key (auth + admin required)',
    method: 'GET',
    path: '/settings/ingest-api-key',
    requiresAuth: true,
    description: 'Fetch ingest API key for tenant.',
  },
  {
    name: 'Email inbound test (auth required)',
    method: 'POST',
    path: '/email/inbound',
    requiresAuth: false,
    description:
      'Inbound email webhook used by settings/email page. Requires tenant-specific secret or to address; expected to be 4xx in most environments.',
    body: {
      to: 'inbound@example.com',
      from: 'endpoint-test@example.com',
      subject: 'Test inbound email from endpoint-tests.ts',
      text: 'This is a test inbound email.',
    },
    tolerateStatus: [404],
    expectedErrorContains: 'Tenant not found for inbound webhook',
  },
  {
    name: 'User actions list (auth required)',
    method: 'GET',
    path: '/actions',
    requiresAuth: true,
    description: 'User actions feed backing /profile page.',
  },
  {
    name: 'Users list (auth required)',
    method: 'GET',
    path: '/users',
    requiresAuth: true,
    description: 'Team list used by /team page.',
  },
  {
    name: 'Notifications list (auth required)',
    method: 'GET',
    path: '/notifications',
    requiresAuth: true,
    description: 'Notifications dropdown feed.',
  },
];

async function runAllEndpoints() {
  const results: EndpointResult[] = [];

  for (const ep of endpoints) {
    const url = ep.path;
    try {
      const { status, ok, bodyText } = await request(ep.method, url, ep.body);
      const authRelevant =
        ep.requiresAuth &&
        (status === 401 ||
          status === 403 ||
          bodyText.toLowerCase().includes('unauthorized') ||
          bodyText.toLowerCase().includes('forbidden'));
      const toleratedStatus =
        Array.isArray(ep.tolerateStatus) && ep.tolerateStatus.includes(status);
      const toleratedError =
        toleratedStatus &&
        (!ep.expectedErrorContains ||
          bodyText.toLowerCase().includes(ep.expectedErrorContains.toLowerCase()));
      const effectiveOk = ok || (!ok && (authRelevant || toleratedError));
      results.push({
        name: ep.name,
        method: ep.method,
        path: ep.path,
        ok: effectiveOk,
        status,
        error: effectiveOk ? undefined : bodyText.slice(0, 400),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      results.push({
        name: ep.name,
        method: ep.method,
        path: ep.path,
        ok: false,
        status: 0,
        error: errorMessage,
      });
    }
  }

  const okItems = results.filter((r) => r.ok);
  const badItems = results.filter((r) => !r.ok);

  console.log('=== Endpoint Test Summary ===');
  console.log(`Base URL: ${API_BASE}`);
  console.log(`Total endpoints: ${results.length}`);
  console.log(`Passing (including expected auth failures): ${okItems.length}`);
  console.log(`Failing: ${badItems.length}`);
  console.log('');

  console.log('=== Per-endpoint results ===');
  for (const r of results) {
    const statusLabel = r.ok ? 'OK' : 'FAIL';
    console.log(
      `[${statusLabel}] ${r.method} ${r.path} -> ${r.status}${r.error ? ` | ${r.error}` : ''}`,
    );
  }

  const hardFailures = badItems.filter((r) => r.status === 0 || r.status >= 500);
  if (hardFailures.length > 0) {
    console.log('');
    console.log('=== Hard backend failures (status 0 or 5xx) ===');
    for (const r of hardFailures) {
      console.log(`[FAIL] ${r.method} ${r.path} -> ${r.status} | ${r.error || 'no message'}`);
    }
    process.exitCode = 1;
  }
}

await runAllEndpoints().catch((err) => {
  console.error('Endpoint test runner crashed:', err);
  process.exitCode = 1;
});

export { runAllEndpoints, endpoints };
