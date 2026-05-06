// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../Landing';
import React from 'react';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: false })),
}));

describe('Landing Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    expect(screen.getByText(/how_it_works/i)).toBeInTheDocument();
  });
});
