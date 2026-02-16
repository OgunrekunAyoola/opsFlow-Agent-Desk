import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { EmailSettings } from '../EmailSettings';
import api from '../../lib/api';
import { ToastProvider } from '../../context/ToastContext';

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

function renderEmailSettings() {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={['/settings/email']}>
        <Routes>
          <Route path="/settings/email" element={<EmailSettings />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('EmailSettings page', () => {
  it('loads inbound address and shows status', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        tenant: {
          inboundAddress: 'support+abc@opsflow.test',
          lastInboundAt: new Date().toISOString(),
        },
      },
    });

    renderEmailSettings();

    await waitFor(() => {
      expect(screen.getByText(/inbound email address/i)).toBeInTheDocument();
    });

    expect(screen.getByText('support+abc@opsflow.test')).toBeInTheDocument();
    expect(screen.getByText(/last email received/i)).toBeInTheDocument();
  });

  it('sends test email when button clicked', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        tenant: {
          inboundAddress: 'support+abc@opsflow.test',
        },
      },
    });
    apiMock.post.mockResolvedValueOnce({});

    renderEmailSettings();

    await waitFor(() => {
      expect(screen.getByText('support+abc@opsflow.test')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /send test email/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/email/inbound', expect.any(Object));
    });
  });
});
