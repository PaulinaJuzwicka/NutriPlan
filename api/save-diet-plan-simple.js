const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'diet-plans');

const ensureOutputDir = async () => {
  try {
    await mkdir(OUTPUT_DIR, { recursive: true });
    console.log('Katalog utworzony lub już istnieje');
    return true;
  } catch (err) {
    console.error('Błąd podczas tworzenia katalogu:', err);
    throw err;
  }
};

const testFileWrite = async () => {
  try {
    await ensureOutputDir();
    const testFilePath = path.join(OUTPUT_DIR, 'test-file.txt');
    await writeFile(testFilePath, 'Testowa zawartość pliku', 'utf8');
    console.log('Plik testowy został zapisany pomyślnie');
    return true;
  } catch (err) {
    console.error('Błąd podczas zapisywania pliku testowego:', err);
    throw err;
  }
};

testFileWrite()
  .then(() => console.log('Test zakończony pomyślnie'))
  .catch(err => console.error('Test nie powiódł się:', err));
