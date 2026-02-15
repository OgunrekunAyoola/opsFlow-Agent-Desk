import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateTicketModal } from '../CreateTicketModal';
import api from '../../../lib/api';
import { ToastProvider } from '../../../context/ToastContext';

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

function renderModal() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  const utils = render(
    <ToastProvider>
      <CreateTicketModal isOpen onClose={onClose} onSuccess={onSuccess} />
    </ToastProvider>,
  );

  return { ...utils, onClose, onSuccess };
}

describe('CreateTicketModal', () => {
  it('loads clients when opened', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: {
        clients: [
          { _id: '1', name: 'Client A' },
          { _id: '2', name: 'Client B' },
        ],
      },
    });

    renderModal();

    await waitFor(() => {
      expect(apiMock.get).toHaveBeenCalledWith('/clients');
      expect(screen.getByText('Client A')).toBeInTheDocument();
    });
  });

  it('submits form and calls onSuccess and onClose', async () => {
    apiMock.get.mockResolvedValueOnce({
      data: { clients: [] },
    });
    apiMock.post.mockResolvedValueOnce({});

    const { onClose, onSuccess } = renderModal();

    const subjectInput = screen.getByPlaceholderText('e.g., Unable to login');
    const nameInput = screen.getByDisplayValue('John Doe');
    const emailInput = screen.getByDisplayValue('demo@example.com');
    const descriptionInput = screen.getByPlaceholderText('Describe the issue...');

    fireEvent.change(subjectInput, {
      target: { value: 'Issue logging in' },
    });
    fireEvent.change(nameInput, {
      target: { value: 'John Updated' },
    });
    fireEvent.change(emailInput, {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(descriptionInput, {
      target: { value: 'Customer cannot log in to the app.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create ticket/i }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/tickets', expect.any(Object));
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
