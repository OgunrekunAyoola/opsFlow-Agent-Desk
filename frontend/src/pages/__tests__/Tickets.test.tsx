import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Tickets } from '../Tickets';
import api from '../../lib/api';
import { ToastProvider } from '../../context/ToastContext';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>;
};

function renderWithRouter(initialEntries: string[] = ['/tickets']) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Tickets />
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('Tickets page', () => {
  it('renders tickets returned from API', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        items: [
          {
            _id: '1',
            subject: 'First ticket',
            status: 'new',
            priority: 'high',
            category: 'billing',
            createdAt: new Date().toISOString(),
            customerEmail: 'customer@example.com',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('First ticket')).toBeInTheDocument();
    });
  });

  it('updates filter and query params when clicking status chips', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      },
    });

    renderWithRouter();

    const newFilter = screen.getByRole('button', { name: 'New' });
    fireEvent.click(newFilter);

    await waitFor(() => {
      expect(apiMock.get).toHaveBeenCalled();
      const lastCall = (apiMock.get as any).mock.calls.at(-1);
      expect(lastCall[0]).toBe('/tickets');
      expect(lastCall[1].params.status).toBe('new');
    });
  });

  it('applies search term when typing in search input', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
      },
    });

    renderWithRouter();

    const searchInput = screen.getByPlaceholderText('Search tickets...');

    fireEvent.change(searchInput, {
      target: { value: 'login' },
    });

    await waitFor(() => {
      expect(apiMock.get).toHaveBeenCalled();
      const lastCall = (apiMock.get as any).mock.calls.at(-1);
      expect(lastCall[0]).toBe('/tickets');
      expect(lastCall[1].params.search).toBe('login');
    });
  });
});
