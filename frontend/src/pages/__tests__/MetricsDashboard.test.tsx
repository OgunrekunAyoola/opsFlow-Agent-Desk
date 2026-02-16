import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MetricsDashboard } from '../MetricsDashboard';
import api from '../../lib/api';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>;
};

function renderMetricsDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard/metrics']}>
      <Routes>
        <Route path="/dashboard/metrics" element={<MetricsDashboard />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('MetricsDashboard page', () => {
  it('shows loading state and then metrics cards', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        rangeDays: 7,
        totalTickets: 10,
        aiResolved: 4,
        aiResolutionRate: 0.4,
        avgResponseMinutes: 15,
        customerSatisfaction: 4.6,
        series: {
          volume: [
            { date: '2024-01-01', count: 3 },
            { date: '2024-01-02', count: 7 },
          ],
          aiVsHuman: {
            aiReplies: 4,
            humanReplies: 6,
          },
          responseTime: [
            { date: '2024-01-01', minutes: 10 },
            { date: '2024-01-02', minutes: 20 },
          ],
          sentiment: {
            positive: 5,
            neutral: 3,
            negative: 2,
          },
          category: [
            { category: 'billing', count: 5 },
            { category: 'bugs', count: 5 },
          ],
        },
      },
    });

    renderMetricsDashboard();

    expect(screen.getByText(/loading metrics dashboard/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/metrics dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/total tickets/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText(/ai resolution rate/i)).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument();
    });
  });

  it('allows changing range', async () => {
    apiMock.get.mockResolvedValue({
      data: {
        rangeDays: 7,
        totalTickets: 1,
        aiResolved: 0,
        aiResolutionRate: 0,
        avgResponseMinutes: 0,
        customerSatisfaction: null,
        series: {
          volume: [],
          aiVsHuman: {
            aiReplies: 0,
            humanReplies: 0,
          },
          responseTime: [],
          sentiment: {},
          category: [],
        },
      },
    });

    renderMetricsDashboard();

    const btn30 = screen.getByRole('button', { name: /last 30 days/i });
    fireEvent.click(btn30);

    await waitFor(() => {
      expect(apiMock.get).toHaveBeenCalledWith('/dashboard/metrics?range=30d');
    });
  });

  it('shows error UI when metrics request fails', async () => {
    apiMock.get.mockRejectedValueOnce({
      response: { status: 500, data: { error: 'Metrics service unavailable' } },
    });

    renderMetricsDashboard();

    await waitFor(() => {
      expect(screen.getByText(/failed to load metrics/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/metrics service unavailable/i)).toBeInTheDocument();
  });
});
