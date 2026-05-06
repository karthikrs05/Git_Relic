import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseGitHistory } from './gitParser.js';

const mockLog = vi.fn();
vi.mock('simple-git', () => ({
  simpleGit: vi.fn(() => ({
    log: mockLog,
  })),
}));

describe('parseGitHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses a real .git directory', async () => {
    mockLog.mockImplementation(async (options) => {
      if (!options) return { total: 2 };
      if (options.n === 1) return { latest: { date: '2023-01-01' } };
      return {
        all: [
          { hash: '123', message: 'init', author_name: 'test', date: '2023-01-01' }
        ]
      };
    });

    const result = await parseGitHistory('/tmp/dir');
    expect(result.commitCount).toBe(2);
    expect(result.commits.length).toBe(1);
    expect(result.commits[0].hash).toBe('123');
  });

  it('handles empty git history', async () => {
    mockLog.mockImplementation(async (options) => {
      if (!options) return { total: 0 };
      if (options.n === 1) return { latest: null };
      return { all: [] };
    });

    const result = await parseGitHistory('/tmp/dir');
    expect(result.commitCount).toBe(0);
    expect(result.commits).toEqual([]);
  });

  it('handles invalid path or error gracefully', async () => {
    mockLog.mockRejectedValue(new Error('Not a git repository'));
    const result = await parseGitHistory('/invalid/path');
    expect(result.commitCount).toBe(0);
    expect(result.commits).toEqual([]);
  });
});
