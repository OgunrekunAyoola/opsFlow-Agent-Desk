import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Signup } from '../Signup';
import api from '../../lib/api';
import { ToastProvider } from '../../context/ToastContext';

vi.mock('../../lib/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const apiMock = api as unknown as {
  post: ReturnType<typeof vi.fn>;
};

function renderWithRouter(initialEntries: string[] = ['/signup']) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Signup />
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('Signup page', () => {
  it('disables submit until password meets requirements', () => {
    renderWithRouter();

    const passwordInput = screen.getByPlaceholderText('Create a strong password');
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: 'weak' } });

    expect(submitButton).toBeDisabled();
  });

  it('submits when all fields valid and shows success state', async () => {
    apiMock.post.mockResolvedValueOnce({
      data: { access_token: 'signup-token' },
    });

    renderWithRouter();

    fireEvent.change(screen.getByPlaceholderText('Acme Corp'), {
      target: { value: 'Acme Corp' },
    });
    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'Jane Example' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@agency.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'StrongPass1!' },
    });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/auth/signup', {
        tenantName: 'Acme Corp',
        name: 'Jane Example',
        email: 'user@example.com',
        password: 'StrongPass1!',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});
