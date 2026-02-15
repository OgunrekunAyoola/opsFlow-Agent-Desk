import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ForgotPassword } from '../ForgotPassword';
import { ResetPassword } from '../ResetPassword';
import { VerifyEmail } from '../VerifyEmail';
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

function renderWithRoutes(initialEntry: string) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ForgotPassword page', () => {
  it('submits email and shows success state', async () => {
    apiMock.post.mockResolvedValueOnce({});

    renderWithRoutes('/forgot-password');

    fireEvent.change(screen.getByPlaceholderText('you@agency.com'), {
      target: { value: 'user@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'user@example.com',
      });
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });
});

describe('ResetPassword page', () => {
  it('shows invalid link state when token missing', () => {
    renderWithRoutes('/reset-password');

    expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
  });

  it('validates password and submits when valid', async () => {
    apiMock.post.mockResolvedValueOnce({});

    renderWithRoutes('/reset-password?token=test-token');

    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], {
      target: { value: 'StrongPass1' },
    });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], {
      target: { value: 'StrongPass1' },
    });

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'test-token',
        password: 'StrongPass1',
      });
    });
  });
});

describe('VerifyEmail page', () => {
  it('starts in error state when token missing', () => {
    renderWithRoutes('/verify-email');

    expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
  });

  it('posts token and shows success on valid verification', async () => {
    apiMock.post.mockResolvedValueOnce({});

    renderWithRoutes('/verify-email?token=abc123');

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/auth/verify-email', { token: 'abc123' });
    });

    await waitFor(() => {
      const matches = screen.getAllByText(/email verified/i);
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
