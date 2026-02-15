import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../Login';
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

function renderWithRouter(initialEntries: string[] = ['/login']) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={initialEntries}>
        <Login />
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('Login page', () => {
  it('submits with email and password and shows loading state', async () => {
    apiMock.post.mockResolvedValueOnce({
      data: { access_token: 'test-token' },
    });

    renderWithRouter();

    const emailInput = screen.getByPlaceholderText('you@agency.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/signing in/i);

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error state on invalid credentials', async () => {
    apiMock.post.mockRejectedValueOnce({
      response: { status: 401 },
    });

    renderWithRouter();

    const emailInput = screen.getByPlaceholderText('you@agency.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = screen.getAllByText(/invalid email or password/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
