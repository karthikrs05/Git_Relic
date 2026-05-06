// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RelicDetail from '../RelicDetail';
import React from 'react';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ projectId: '1' }) };
});

vi.mock('../../services/projects', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getProjectById: vi.fn().mockResolvedValue({ _id: '1', title: 'test', metadata: {} }),
    getProjectAnalysis: vi.fn().mockResolvedValue({}),
  };
});

vi.mock('../../services/pitches', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getPitchesForProject: vi.fn().mockResolvedValue([]),
    respondToPitch: vi.fn().mockResolvedValue({}),
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: { id: '2' }, isAuthenticated: true })),
}));

describe('RelicDetail Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><RelicDetail /></MemoryRouter>);
    // Initially shows loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
