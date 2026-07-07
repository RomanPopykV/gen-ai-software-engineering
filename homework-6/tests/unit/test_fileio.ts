import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { ensureDirectories, writeJson, readJsonFile, readJsonFiles, clearDirectory } from '../../src/utils/fileio';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hw6-fileio-test-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('ensureDirectories', () => {
  test('creates all four shared subdirectories under actual cwd', async () => {
    // SHARED_DIR is resolved at module load time from the real cwd.
    // Just verify ensureDirectories() runs without error and creates directories.
    await expect(ensureDirectories()).resolves.not.toThrow();
    const actualShared = path.resolve(process.cwd(), 'shared');
    for (const sub of ['input', 'processing', 'output', 'results']) {
      const stat = await fs.stat(path.join(actualShared, sub));
      expect(stat.isDirectory()).toBe(true);
    }
  });

  test('is idempotent — calling twice does not throw', async () => {
    await ensureDirectories();
    await expect(ensureDirectories()).resolves.not.toThrow();
  });
});

describe('writeJson / readJsonFile', () => {
  test('writes and reads back JSON correctly', async () => {
    const filePath = path.join(tmpDir, 'test.json');
    const data = { foo: 'bar', count: 42 };
    await writeJson(filePath, data);
    const result = await readJsonFile<typeof data>(filePath);
    expect(result).toEqual(data);
  });

  test('readJsonFile parses JSON from file', async () => {
    const filePath = path.join(tmpDir, 'sample.json');
    await fs.writeFile(filePath, JSON.stringify({ hello: 'world' }));
    const result = await readJsonFile<{ hello: string }>(filePath);
    expect(result.hello).toBe('world');
  });
});

describe('readJsonFiles', () => {
  test('returns empty array for non-existent directory', async () => {
    const result = await readJsonFiles(path.join(tmpDir, 'nonexistent'));
    expect(result).toEqual([]);
  });

  test('reads all json files from directory', async () => {
    await fs.writeFile(path.join(tmpDir, 'a.json'), JSON.stringify({ id: 1 }));
    await fs.writeFile(path.join(tmpDir, 'b.json'), JSON.stringify({ id: 2 }));
    await fs.writeFile(path.join(tmpDir, 'skip.txt'), 'ignored');
    const results = await readJsonFiles<{ id: number }>(tmpDir);
    expect(results).toHaveLength(2);
    const ids = results.map((r) => r.data.id).sort();
    expect(ids).toEqual([1, 2]);
  });

  test('includes the filename in each result', async () => {
    await fs.writeFile(path.join(tmpDir, 'tx.json'), JSON.stringify({ x: 1 }));
    const results = await readJsonFiles(tmpDir);
    expect(results[0].file).toBe('tx.json');
  });
});

describe('clearDirectory', () => {
  test('removes all json files from directory', async () => {
    await fs.writeFile(path.join(tmpDir, 'a.json'), '{}');
    await fs.writeFile(path.join(tmpDir, 'b.json'), '{}');
    await clearDirectory(tmpDir);
    const files = await fs.readdir(tmpDir);
    expect(files.filter((f) => f.endsWith('.json'))).toHaveLength(0);
  });

  test('does not throw for non-existent directory', async () => {
    await expect(
      clearDirectory(path.join(tmpDir, 'missing')),
    ).resolves.not.toThrow();
  });

  test('leaves non-json files untouched', async () => {
    await fs.writeFile(path.join(tmpDir, 'keep.txt'), 'data');
    await fs.writeFile(path.join(tmpDir, 'remove.json'), '{}');
    await clearDirectory(tmpDir);
    const files = await fs.readdir(tmpDir);
    expect(files).toContain('keep.txt');
    expect(files).not.toContain('remove.json');
  });
});
