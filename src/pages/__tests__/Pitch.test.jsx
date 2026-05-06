// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pitch from '../Pitch';
import React from 'react';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: 'fake-token' })),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useLocation: () => ({ state: { projectId: '1' } }), useNavigate: vi.fn() };
});

vi.mock('../../services/projects', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, getProjectById: vi.fn().mockResolvedValue({ _id: '1', title: 'test', metadata: {} }) };
});

vi.mock('../../services/pitches', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, submitPitch: vi.fn().mockResolvedValue({}) };
});

describe('Pitch Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Pitch /></MemoryRouter>);
    expect(screen.getByText(/submit_pitch\.md/i)).toBeInTheDocument();
  });
});
