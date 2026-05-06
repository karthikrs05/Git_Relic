import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeProjectWithAI(projectDir, gitData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    // Read README
    let readme = '';
    const readmePaths = ['README.md', 'readme.md', 'README.txt', 'readme.txt'];
    for (const filePath of readmePaths) {
      try {
        readme = await fs.readFile(path.join(projectDir, filePath), 'utf-8');
        break;
      } catch {
        // Continue to next path
      }
    }

    // Extract commit messages
    const commitMessages = gitData.commits
      .slice(0, 10)
      .map((c) => `${c.date}: ${c.message}`)
      .join('\n');

    // Build prompt for AI
    const prompt = `You are a project forensic analyst. Analyze this abandoned GitHub project and provide insights.

PROJECT INFORMATION:
- Total Commits: ${gitData.commitCount}
- Last Activity: ${gitData.lastActivity}
- Recent Commits:
${commitMessages}

README (if exists):
${readme || 'No README found'}

Based on the above information, provide a JSON response with:
1. "summary" (2-3 sentences about what the project does)
2. "failureReason" (why you think it was abandoned - e.g., "Dependency Hell", "Scope Creep", "Burnout", "Technical Debt", etc.)
3. "roadmap" (array of 3 specific, actionable steps to resurrect this project)
4. "difficulty" (one of: "Beginner", "Intermediate", "Advanced")
5. "estimatedHours" (rough estimate of hours to complete the roadmap)

Respond ONLY with valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch {
      // If parsing fails, extract JSON from text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : getDefaultAnalysis();
    }

    return {
      summary: analysis.summary || 'Unable to analyze project',
      failureReason: analysis.failureReason || 'Unknown',
      roadmap: analysis.roadmap || ['Step 1: Review project structure', 'Step 2: Identify core issues', 'Step 3: Start implementation'],
      difficulty: analysis.difficulty || 'Intermediate',
      estimatedHours: analysis.estimatedHours || '20-40',
      analyzedAt: new Date(),
    };
  } catch (error) {
    console.error('AI analysis error:', error.message);
    return getDefaultAnalysis();
  }
}

function getDefaultAnalysis() {
  return {
    summary: 'This is an abandoned project awaiting analysis.',
    failureReason: 'Unknown - manual review recommended',
    roadmap: [
      'Step 1: Review project documentation and recent commits',
      'Step 2: Identify blocking issues or technical debt',
      'Step 3: Plan incremental fixes and improvements',
    ],
    difficulty: 'Intermediate',
    estimatedHours: '20-40',
    analyzedAt: new Date(),
  };
}
