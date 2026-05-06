// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import React from 'react';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { username: 'testuser' }, isAuthenticated: true })),
}));

vi.mock('../../services/projects', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getUserProjects: vi.fn().mockResolvedValue([]) };
});

vi.mock('../../services/pitches', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getUserPitches: vi.fn().mockResolvedValue([]) };
});

describe('Dashboard Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/loading_data/i)).toBeInTheDocument();
  });
});
