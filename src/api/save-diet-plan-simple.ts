import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { DEFAULT_OUTPUT_DIR } from './types';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * Sprawdza i tworzy katalog wyjściowy, jeśli nie istnieje
 * @param outputDir - Ścieżka do katalogu wyjściowego
 * @returns Promise<boolean> - Zwraca true, jeśli katalog istnieje lub został utworzony
 */
export const ensureOutputDir = async (outputDir: string = DEFAULT_OUTPUT_DIR): Promise<boolean> => {
  try {
    await mkdir(outputDir, { recursive: true });
    return true;
  } catch (err) {
    throw err;
  }
};

/**
 * Testuje możliwość zapisu plików w podanym katalogu
 * @param outputDir - Ścieżka do katalogu wyjściowego
 * @returns Promise<boolean> - Zwraca true, jeśli test zakończył się powodzeniem
 */
export const testFileWrite = async (outputDir: string = DEFAULT_OUTPUT_DIR): Promise<boolean> => {
  try {
    await ensureOutputDir(outputDir);
    const testFilePath = path.join(outputDir, 'test-file.txt');
    await writeFile(testFilePath, 'Testowa zawartość pliku', 'utf8');
    return true;
  } catch (err) {
    throw err;
  }
};

// Uruchomienie testu, jeśli plik jest wykonywany bezpośrednio
if (require.main === module) {
  testFileWrite()
}

export default {
  ensureOutputDir,
  testFileWrite,
};
