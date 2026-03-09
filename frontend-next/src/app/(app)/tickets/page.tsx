import {
  listTicketsAction,
  createTicketAction,
  triageTicketAction,
  searchTicketsAction,
  replyTicketAction,
  Ticket,
} from '@/actions/ticket-actions';
import SearchInput from '@/components/SearchInput';

const DEMO_TENANT_ID = '65f2d6c0c9b9a1b2c3d4e5f6';
const DEMO_USER_ID = '65f2d6c0c9b9a1b2c3d4e5f7';

export default async function TicketsPage(props: { searchParams: Promise<{ query?: string }> }) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  let tickets: Ticket[] = [];
  if (query) {
    const result = await searchTicketsAction(DEMO_TENANT_ID, query);
    tickets = result.success && result.data ? result.data.tickets : [];
  } else {
    const result = await listTicketsAction(DEMO_TENANT_ID);
    tickets = result.success && result.data ? result.data.tickets : [];
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">gRPC Ticket Dashboard</h1>

      {/* Create Ticket Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Ticket</h2>
        <form
          action={async (formData) => {
            'use server';
            await createTicketAction(formData);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="tenantId" value={DEMO_TENANT_ID} />
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              name="subject"
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="e.g., Cannot access dashboard"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Body</label>
            <textarea
              name="body"
              required
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Describe the issue..."
            />
          </div>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create via gRPC
          </button>
        </form>
      </div>

      {/* Ticket List Header and Search */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <div className="w-1/2 max-w-sm">
          <SearchInput />
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {tickets.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              {query
                ? `No tickets found matching "${query}"`
                : 'No tickets found. Create one above!'}
            </li>
          ) : (
            tickets.map((ticket: Ticket) => (
              <li key={ticket.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600 truncate">{ticket.subject}</p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="truncate">{ticket.body}</span>
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-400 gap-2">
                      <span>ID: {ticket.id}</span>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>

                    {/* AI Draft Section */}
                    {ticket.aiDraftText && (
                      <div className="mt-4 p-3 bg-indigo-50 rounded-md border border-indigo-100">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            AI Suggested Reply
                          </h4>
                          {ticket.aiConfidence !== undefined && (
                            <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                              {Math.round(ticket.aiConfidence * 100)}% Confidence
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono text-xs">
                          {ticket.aiDraftText}
                        </p>
                        {ticket.aiSuggestedCategory && (
                          <div className="mt-2 text-xs text-gray-500 border-t border-indigo-100 pt-2">
                            Suggested Category:{' '}
                            <span className="font-medium text-gray-700">
                              {ticket.aiSuggestedCategory}
                            </span>
                          </div>
                        )}
                        <form
                          action={async () => {
                            'use server';
                            await replyTicketAction(
                              ticket.id,
                              DEMO_TENANT_ID,
                              ticket.aiDraftText || '',
                              DEMO_USER_ID,
                            );
                          }}
                          className="mt-3"
                        >
                          <button
                            type="submit"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Approve & Send Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        ticket.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.status === 'triaged'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        ticket.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {ticket.priority}
                    </span>

                    <form
                      action={async () => {
                        'use server';
                        await triageTicketAction(ticket.id, DEMO_TENANT_ID, DEMO_USER_ID);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs text-indigo-600 hover:text-indigo-900 border border-indigo-200 rounded px-2 py-1 mt-1"
                      >
                        Run Triage AI
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
