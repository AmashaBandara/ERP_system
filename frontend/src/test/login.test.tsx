import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';

vi.mock('@/app/auth-store', () => ({
  useAuthStore: (fn: (s: unknown) => unknown) =>
    fn({
      user: null,
      status: 'unauthenticated',
      login: vi.fn(),
      logout: vi.fn(),
      fetchMe: vi.fn(),
    }),
}));

describe('LoginPage', () => {
  it('renders sign-in form', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Waikkal Hospitality ERP')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});