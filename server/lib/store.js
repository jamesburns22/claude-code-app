import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '../../data');

function filePath(name) {
  return resolve(dataDir, `${name}.json`);
}

export function read(name) {
  return JSON.parse(readFileSync(filePath(name), 'utf8'));
}

export function write(name, data) {
  writeFileSync(filePath(name), JSON.stringify(data, null, 2), 'utf8');
}
