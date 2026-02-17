import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopBar } from '../TopBar';
import api from '../../../lib/api';

vi.mock('../../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

function renderTopBar() {
  return render(
    <MemoryRouter>
      <TopBar />
    </MemoryRouter>,
  );
}

describe('TopBar notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads notifications and shows unread badge', async () => {
    apiMock.get.mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: { name: 'Agent Smith' },
            tenant: { name: 'Acme Inc' },
          },
        });
      }
      if (url === '/notifications') {
        return Promise.resolve({
          data: {
            items: [
              {
                _id: 'n1',
                type: 'ticket_assigned',
                message: 'You were assigned ticket #123456',
                url: '/tickets/123',
                createdAt: new Date().toISOString(),
              },
            ],
            unreadCount: 1,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    renderTopBar();

    const bellButton = await screen.findByRole('button', { name: /open notifications/i });
    await waitFor(() => {
      expect(bellButton.textContent).toMatch(/1/);
    });

    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/you were assigned ticket/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when there are no notifications', async () => {
    apiMock.get.mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: { name: 'Agent Smith' },
            tenant: { name: 'Acme Inc' },
          },
        });
      }
      if (url === '/notifications') {
        return Promise.resolve({
          data: {
            items: [],
            unreadCount: 0,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    renderTopBar();

    const bellButton = await screen.findByRole('button', { name: /open notifications/i });
    expect(bellButton.textContent).not.toMatch(/[1-9]/);

    fireEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText(/you are all caught up/i)).toBeInTheDocument();
    });
  });

  it('caps unread badge at 9+ when count is large', async () => {
    apiMock.get.mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: { name: 'Agent Smith' },
            tenant: { name: 'Acme Inc' },
          },
        });
      }
      if (url === '/notifications') {
        return Promise.resolve({
          data: {
            items: [
              {
                _id: 'n1',
                type: 'ticket_assigned',
                message: 'You were assigned ticket #123456',
                url: '/tickets/123',
                createdAt: new Date().toISOString(),
              },
            ],
            unreadCount: 25,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    renderTopBar();

    const bellButton = await screen.findByRole('button', { name: /open notifications/i });
    await waitFor(() => {
      expect(bellButton.textContent).toMatch(/9\+/);
    });
  });

  it('marks a notification as read when clicked', async () => {
    apiMock.get.mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: { name: 'Agent Smith' },
            tenant: { name: 'Acme Inc' },
          },
        });
      }
      if (url === '/notifications') {
        return Promise.resolve({
          data: {
            items: [
              {
                _id: 'n1',
                type: 'ticket_assigned',
                message: 'You were assigned ticket #123456',
                url: '/tickets/123',
                createdAt: new Date().toISOString(),
              },
            ],
            unreadCount: 1,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockResolvedValue({ data: {} });

    renderTopBar();

    const bellButton = await screen.findByRole('button', { name: /open notifications/i });
    await waitFor(() => {
      expect(bellButton.textContent).toMatch(/1/);
    });

    fireEvent.click(bellButton);

    const notif = await screen.findByText(/you were assigned ticket/i);
    fireEvent.click(notif);

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/notifications/n1/read');
    });
  });

  it('marks all notifications as read', async () => {
    apiMock.get.mockImplementation((url: string) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: { name: 'Agent Smith' },
            tenant: { name: 'Acme Inc' },
          },
        });
      }
      if (url === '/notifications') {
        return Promise.resolve({
          data: {
            items: [
              {
                _id: 'n1',
                type: 'ticket_assigned',
                message: 'You were assigned ticket #123456',
                url: '/tickets/123',
                createdAt: new Date().toISOString(),
              },
            ],
            unreadCount: 1,
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockResolvedValue({ data: {} });

    renderTopBar();

    const bellButton = await screen.findByRole('button', { name: /open notifications/i });
    await waitFor(() => {
      expect(bellButton.textContent).toMatch(/1/);
    });

    fireEvent.click(bellButton);

    const markAllButton = await screen.findByRole('button', { name: /mark all as read/i });
    fireEvent.click(markAllButton);

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/notifications/mark-all-read');
    });
  });
});
