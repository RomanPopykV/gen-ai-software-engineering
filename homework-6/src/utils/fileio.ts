import { promises as fs } from 'fs';
import path from 'path';

const SHARED_DIR = path.resolve(process.cwd(), 'shared');

export const DIRS = {
  input: path.join(SHARED_DIR, 'input'),
  processing: path.join(SHARED_DIR, 'processing'),
  output: path.join(SHARED_DIR, 'output'),
  results: path.join(SHARED_DIR, 'results'),
} as const;

export async function ensureDirectories(): Promise<void> {
  for (const dir of Object.values(DIRS)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

export async function readJsonFiles<T>(
  dir: string,
): Promise<Array<{ file: string; data: T }>> {
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const jsonFiles = files.filter((f) => f.endsWith('.json'));
  const results: Array<{ file: string; data: T }> = [];
  for (const file of jsonFiles) {
    const filePath = path.join(dir, file);
    const data = await readJsonFile<T>(filePath);
    results.push({ file, data });
  }
  return results;
}

export async function clearDirectory(dir: string): Promise<void> {
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(dir, file));
      }
    }
  } catch {
    // Directory may not exist yet — safe to ignore
  }
}
