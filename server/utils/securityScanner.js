import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import { createRequire } from 'module';

const execAsync = promisify(exec);
const require = createRequire(import.meta.url);

// Resolve the gitleaks binary: tries the npm-bundled binary first,
// falls back to a system-installed `gitleaks` on PATH.
function getGitleaksBinary() {
  const platform = process.platform;
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';

  const npmBinaryMap = {
    linux:  `gitleaks/dist/gitleaks-linux-${arch}`,
    darwin: `gitleaks/dist/gitleaks-darwin-${arch}`,
    win32:  `gitleaks/dist/gitleaks-windows-${arch}.exe`,
  };

  const npmPath = npmBinaryMap[platform];
  if (npmPath) {
    try {
      return require.resolve(npmPath);
    } catch {
      // npm package binary not present — fall through to system PATH
    }
  }

  // System-installed gitleaks (installed via package manager or standalone)
  return platform === 'win32' ? 'gitleaks.exe' : 'gitleaks';
}

export async function scanWithGitleaks(projectPath) {
  try {
    const gitleaksPath = getGitleaksBinary();

    // Run gitleaks scan
    const { stdout, stderr } = await execAsync(
      `"${gitleaksPath}" detect --source "${projectPath}" --verbose --exit-code 0`,
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
    // gitleaks not installed — don't block the upload, just skip the scan
    const isNotFound =
      error.code === 'ENOENT' ||
      error.message?.includes('not found') ||
      error.message?.includes('No such file') ||
      error.message?.includes('cannot find the file') ||
      error.message?.includes('not recognized');

    if (isNotFound) {
      console.warn('[WARN] gitleaks binary not found. Security scan skipped — install gitleaks to enable scanning.');
      return {
        passed: true,
        issues: [],
        skipped: true,
        reason: 'gitleaks not installed',
        rawOutput: 'gitleaks not available: ' + error.message,
      };
    }

    // Real scan error (timeout, permissions, etc.) — fail safe
    console.error('Gitleaks scan error:', error.message);
    return {
      passed: false,
      issues: [{ type: 'scan_error', severity: 'HIGH', file: 'N/A', line: 'N/A' }],
      rawOutput: error.message,
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
