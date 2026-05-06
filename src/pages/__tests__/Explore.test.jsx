// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Explore from '../Explore';
import React from 'react';

vi.mock('../../services/projects', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, listProjects: vi.fn().mockResolvedValue([]) };
});

describe('Explore Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Explore /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/search_relics/i)).toBeInTheDocument();
  });
});
