// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/auth';
import React from 'react';

vi.mock('../services/auth', () => ({
  fetchMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}));

const TestComponent = () => {
  const { user, login, logout, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  if (!isAuthenticated) return (
    <div>
      <div data-testid="unauth">Not authenticated</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>Login</button>
    </div>
  );
  
  return (
    <div>
      <div data-testid="auth">Authenticated as {user?.username}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('reads existing token from sessionStorage on mount', async () => {
    sessionStorage.setItem('gr_token', 'fake-token');
    authService.fetchMe.mockResolvedValue({ username: 'testuser' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated as testuser');
    });
    
    expect(authService.fetchMe).toHaveBeenCalledWith('fake-token');
  });

  it('login stores token in sessionStorage and provides user state', async () => {
    authService.login.mockResolvedValue({ token: 'new-token', user: { username: 'newuser' } });
    authService.fetchMe.mockResolvedValue({ username: 'newuser' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('unauth')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toHaveTextContent('Authenticated as newuser');
    });

    expect(sessionStorage.getItem('gr_token')).toBe('new-token');
  });

  it('logout clears token from sessionStorage', async () => {
    sessionStorage.setItem('gr_token', 'fake-token');
    authService.fetchMe.mockResolvedValue({ username: 'testuser' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('unauth')).toBeInTheDocument();
    });

    expect(sessionStorage.getItem('gr_token')).toBeNull();
  });
});
