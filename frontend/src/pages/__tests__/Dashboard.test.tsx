import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard page', () => {
  it('shows loading state initially', () => {
    apiMock.get.mockResolvedValue({
      data: {},
    });

    renderDashboard();

    expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
  });

  it('renders stats and verification banner for unverified user', async () => {
    apiMock.get.mockImplementation((url: string) => {
      if (url === '/dashboard/stats') {
        return Promise.resolve({
          data: {
            totalTickets: 5,
            byStatus: { new: 2 },
            byPriority: { urgent: 1 },
            recentTickets: [],
            totalUsers: 3,
          },
        });
      }
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: {
              email: 'user@example.com',
              isEmailVerified: false,
            },
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    apiMock.post.mockResolvedValue({});

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();

    const resendButton = screen.getByRole('button', { name: /resend/i });
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/auth/resend-verification', {
        email: 'user@example.com',
      });
    });
  });
});
