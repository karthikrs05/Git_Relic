// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';
import React from 'react';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-state">{JSON.stringify(location.state)}</div>;
};

describe('ProtectedRoute', () => {
  it('shows loading spinner while auth state is resolving', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ loading: true, isAuthenticated: false });
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByText('auth_check_in_progress...')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ loading: false, isAuthenticated: true });
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="child">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('redirects unauthenticated user to /auth and preserves destination', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({ loading: false, isAuthenticated: false });
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/protected" element={
            <ProtectedRoute>
              <div data-testid="child">Protected Content</div>
            </ProtectedRoute>
          } />
          <Route path="/auth" element={
            <div>
              Auth Page
              <LocationDisplay />
            </div>
          } />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Auth Page')).toBeInTheDocument();
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    
    const stateElement = screen.getByTestId('location-state');
    expect(stateElement.textContent).toContain('/protected');
  });
});
