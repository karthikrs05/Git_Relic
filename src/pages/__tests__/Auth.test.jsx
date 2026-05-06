// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from '../Auth';
import React from 'react';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ login: vi.fn(), register: vi.fn(), isAuthenticated: false, loading: false })),
}));

describe('Auth Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Auth /></MemoryRouter>);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
