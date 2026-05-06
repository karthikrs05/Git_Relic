// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Leaderboard from '../Leaderboard';
import React from 'react';

describe('Leaderboard Page', () => {
  it('renders without crashing', () => {
    render(<MemoryRouter><Leaderboard /></MemoryRouter>);
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument();
  });
});
