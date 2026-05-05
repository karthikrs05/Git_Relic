import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function scanWithGitleaks(projectPath) {
  try {
    const gitleaksPath = require.resolve('gitleaks/dist/gitleaks-linux-x64');

    // Run gitleaks scan
    const { stdout, stderr } = await execAsync(
      `${gitleaksPath} detect --source ${projectPath} --verbose --exit-code 0`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large outputs
    );

    if (stdout) {
      try {
        const results = JSON.parse(stdout);
        return {
          passed: !results || results.length === 0,
          issues: results || [],
          rawOutput: stdout,
        };
      } catch {
        // If not JSON, parse as text
        return {
          passed: !stdout.includes('found') && !stdout.includes('secret'),
          issues: [],
          rawOutput: stdout,
        };
      }
    }

    return {
      passed: true,
      issues: [],
      rawOutput: '',
    };
  } catch (error) {
    // Gitleaks may exit with code 1 if secrets found, which is expected
    console.log('Gitleaks scan completed with output');

    // Try to extract results from stderr or return safe default
    return {
      passed: false,
      issues: [error.message || 'Secrets detected during scan'],
      rawOutput: error.message || '',
    };
  }
}

export function sanitizeIssues(issues) {
  // Filter and format issues for user display without exposing actual secrets
  return issues
    .slice(0, 10) // Limit to first 10 issues
    .map(issue => ({
      file: issue.File || 'unknown',
      type: issue.RuleID || issue.rule || 'secret_detected',
      line: issue.StartLine || 'unknown',
      severity: 'HIGH',
    }));
}

export async function saveSecurityReport(projectId, scanResult, db) {
  try {
    const reportPath = `/uploads/security/${projectId}-scan.json`;
    await fs.mkdir('/uploads/security', { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(scanResult, null, 2));
    return reportPath;
  } catch (error) {
    console.error('Failed to save security report:', error.message);
    return null;
  }
}
