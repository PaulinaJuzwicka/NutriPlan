const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '..', 'public', 'diet-plans');
const testFile = path.join(testDir, 'test-file.txt');

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
  console.log('Utworzono katalog:', testDir);
} else {
  console.log('Katalog już istnieje:', testDir);
}

try {
  fs.writeFileSync(testFile, 'To jest testowa zawartość pliku', 'utf8');
  console.log('Pomyślnie zapisano plik testowy:', testFile);
} catch (err) {
  console.error('Błąd podczas zapisywania pliku:', err);
}
