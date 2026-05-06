import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeProjectWithAI } from './aiAnalyzer.js';

const { mockGenerateContent, mockGetGenerativeModel } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  return {
    mockGenerateContent,
    mockGetGenerativeModel: vi.fn(() => ({ generateContent: mockGenerateContent }))
  };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return mockGetGenerativeModel();
    }
  }
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn().mockResolvedValue('Mock README content'),
  },
}));

describe('analyzeProjectWithAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const gitData = { commitCount: 5, lastActivity: new Date(), commits: [] };

  it('analyzes project with AI and returns valid data', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({ summary: 'A good project', failureReason: 'Burnout', roadmap: ['Fix it'], difficulty: 'Beginner', estimatedHours: '10' })
      }
    });

    const result = await analyzeProjectWithAI('/tmp/dir', gitData);
    expect(result.summary).toBe('A good project');
    expect(result.difficulty).toBe('Beginner');
  });

  it('handles missing GEMINI_API_KEY gracefully without throwing', async () => {
    mockGenerateContent.mockRejectedValue(new Error('API key not valid'));
    const result = await analyzeProjectWithAI('/tmp/dir', gitData);
    
    // According to current implementation, it catches errors and returns a default analysis.
    expect(result).not.toBeNull();
    expect(result.summary).toMatch(/abandoned/i);
    expect(result.failureReason).toMatch(/Unknown/i);
  });

  it('handles malformed JSON from Gemini gracefully', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "Here is your analysis: { \"summary\": \"Cool stuff\" } and more text"
      }
    });
    const result = await analyzeProjectWithAI('/tmp/dir', gitData);
    expect(result.summary).toBe('Cool stuff');
  });
});
