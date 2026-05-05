import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

// fileExtractor uses top-level await to create dirs at import time.
// We import it after the temp dirs are set up.
const { validateProjectStructure, getProjectMetadata, cleanupTempFile, cleanupProjectDir } =
  await import('../utils/fileExtractor.js');

let tmpDir;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'relic-test-'));
});

afterEach(async () => {
  // Best-effort cleanup
  try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch {}
});

// ── validateProjectStructure ────────────────────────────────────────────────

describe('validateProjectStructure', () => {
  it('returns the same dir when .git is at the root', async () => {
    await fs.mkdir(path.join(tmpDir, '.git'));
    const result = await validateProjectStructure(tmpDir);
    expect(result).toBe(tmpDir);
  });

  it('returns the subfolder path when zip wrapped the project in a folder', async () => {
    const subDir = path.join(tmpDir, 'my-project');
    await fs.mkdir(subDir);
    await fs.mkdir(path.join(subDir, '.git'));
    const result = await validateProjectStructure(tmpDir);
    expect(result).toBe(subDir);
  });

  it('throws when .git directory is missing at root and subfolders', async () => {
    await expect(validateProjectStructure(tmpDir)).rejects.toThrow(/Invalid project/);
  });

  it('throws when .git is a file, not a directory', async () => {
    await fs.writeFile(path.join(tmpDir, '.git'), 'not a dir');
    await expect(validateProjectStructure(tmpDir)).rejects.toThrow(/Invalid project/);
  });
});

// ── getProjectMetadata ───────────────────────────────────────────────────────

describe('getProjectMetadata', () => {
  it('detects JavaScript and Python files', async () => {
    await fs.writeFile(path.join(tmpDir, 'index.js'), '');
    await fs.writeFile(path.join(tmpDir, 'script.py'), '');
    const meta = await getProjectMetadata(tmpDir);
    expect(meta.languages).toContain('JavaScript');
    expect(meta.languages).toContain('Python');
    expect(meta.fileCount).toBeGreaterThanOrEqual(2);
  });

  it('deduplicates languages', async () => {
    await fs.writeFile(path.join(tmpDir, 'a.js'), '');
    await fs.writeFile(path.join(tmpDir, 'b.js'), '');
    const meta = await getProjectMetadata(tmpDir);
    const jsCount = meta.languages.filter((l) => l === 'JavaScript').length;
    expect(jsCount).toBe(1);
  });

  it('ignores unknown extensions', async () => {
    await fs.writeFile(path.join(tmpDir, 'data.xyz'), '');
    const meta = await getProjectMetadata(tmpDir);
    expect(meta.languages).not.toContain('xyz');
  });

  it('returns zeros for empty directory', async () => {
    const meta = await getProjectMetadata(tmpDir);
    expect(meta.languages).toEqual([]);
    expect(meta.fileCount).toBe(0);
  });
});

// ── cleanupTempFile ──────────────────────────────────────────────────────────

describe('cleanupTempFile', () => {
  it('deletes the file', async () => {
    const filePath = path.join(tmpDir, 'upload.zip');
    await fs.writeFile(filePath, 'data');
    await cleanupTempFile(filePath);
    await expect(fs.access(filePath)).rejects.toThrow();
  });

  it('does not throw if file does not exist', async () => {
    await expect(cleanupTempFile('/nonexistent/path/file.zip')).resolves.not.toThrow();
  });
});

// ── cleanupProjectDir ────────────────────────────────────────────────────────

describe('cleanupProjectDir', () => {
  it('removes the directory and all its contents', async () => {
    const projectDir = path.join(tmpDir, 'project-uuid');
    await fs.mkdir(projectDir);
    await fs.writeFile(path.join(projectDir, 'file.js'), '');
    await cleanupProjectDir(projectDir);
    await expect(fs.access(projectDir)).rejects.toThrow();
  });

  it('does not throw if directory does not exist', async () => {
    await expect(cleanupProjectDir('/nonexistent/dir')).resolves.not.toThrow();
  });
});
