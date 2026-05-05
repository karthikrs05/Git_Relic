import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { Extract } from 'unzipper';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads/projects');
const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure directories exist
await fs.mkdir(UPLOAD_DIR, { recursive: true });
await fs.mkdir(TEMP_DIR, { recursive: true });

export async function extractZip(zipPath, extractId) {
  try {
    const projectDir = path.join(UPLOAD_DIR, extractId);
    await fs.mkdir(projectDir, { recursive: true });

    return new Promise((resolve, reject) => {
      createReadStream(zipPath)
        .pipe(Extract({ path: projectDir }))
        .on('close', () => {
          resolve(projectDir);
        })
        .on('error', reject);
    });
  } catch (error) {
    console.error('Extraction error:', error.message);
    throw error;
  }
}

export async function validateProjectStructure(projectDir) {
  try {
    // Check if .git directory exists
    const gitDir = path.join(projectDir, '.git');
    const stats = await fs.stat(gitDir);
    if (!stats.isDirectory()) {
      throw new Error('Invalid project: missing .git directory');
    }
    return true;
  } catch (error) {
    throw new Error('Invalid project structure: ' + error.message);
  }
}

export async function cleanupTempFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
}

export async function getProjectMetadata(projectDir) {
  try {
    const files = await fs.readdir(projectDir, { recursive: true });
    const fileCount = files.length;

    // Detect languages based on file extensions
    const extensions = new Set();
    for (const file of files) {
      if (typeof file === 'string') {
        const ext = path.extname(file);
        if (ext) extensions.add(ext);
      }
    }

    const languageMap = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'JSX',
      '.tsx': 'TSX',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.go': 'Go',
      '.rs': 'Rust',
      '.rb': 'Ruby',
      '.php': 'PHP',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
    };

    const languages = Array.from(extensions)
      .filter(ext => languageMap[ext])
      .map(ext => languageMap[ext]);

    return {
      languages: [...new Set(languages)],
      fileCount,
    };
  } catch (error) {
    console.error('Metadata extraction error:', error.message);
    return { languages: [], fileCount: 0 };
  }
}
