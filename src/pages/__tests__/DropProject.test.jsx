// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DropProject from '../DropProject';
import React from 'react';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(() => ({ token: 'fake-token' })),
}));

vi.mock('../../services/projects', () => ({
  uploadProject: vi.fn().mockResolvedValue({}),
}));

describe('DropProject Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><DropProject /></MemoryRouter>);
    expect(screen.getByText(/drop_project_wizard/i)).toBeInTheDocument();
  });
});
