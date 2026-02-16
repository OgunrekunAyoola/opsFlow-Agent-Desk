import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Settings } from '../Settings';
import api from '../../lib/api';
import { ToastProvider } from '../../context/ToastContext';

vi.mock('../../lib/api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const apiMock = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

function renderSettings() {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <Settings />
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('Settings page', () => {
  it('loads inbound address and auto-reply settings', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        tenant: {
          inboundAddress: 'support+1@opsflow.test',
          autoReplyEnabled: true,
          autoReplyConfidenceThreshold: 0.85,
          autoReplySafeCategories: ['general', 'feature_request'],
        },
      },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('support+1@opsflow.test')).toBeInTheDocument();
    });

    expect(screen.getByText(/AI Auto-Reply/i)).toBeInTheDocument();
  });

  it('saves auto-reply settings', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        tenant: {
          inboundAddress: 'support+1@opsflow.test',
          autoReplyEnabled: false,
          autoReplyConfidenceThreshold: 0.9,
          autoReplySafeCategories: ['general', 'feature_request'],
        },
      },
    });

    apiMock.patch.mockResolvedValueOnce({
      data: {
        autoReplyEnabled: true,
        autoReplyConfidenceThreshold: 0.8,
        autoReplySafeCategories: ['general'],
      },
    });

    renderSettings();

    await waitFor(() => {
      expect(screen.getByText('support+1@opsflow.test')).toBeInTheDocument();
    });

    const toggle = screen.getByRole('button', { name: /toggle ai auto-reply/i });
    fireEvent.click(toggle);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiMock.patch).toHaveBeenCalledWith('/auth/auto-reply-settings', {
        enabled: true,
        confidenceThreshold: expect.any(Number),
        safeCategories: expect.any(Array),
      });
    });
  });
});
