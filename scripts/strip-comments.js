import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function stripComments(code) {
  let result = '';
  let i = 0;
  const len = code.length;

  while (i < len) {
    if (code.startsWith('{/*', i)) {
      const end = code.indexOf('*/}', i + 3);
      if (end !== -1) {
        i = end + 3;
        continue;
      }
    }

    const ch = code[i];
    const next = code[i + 1];

    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      result += ch;
      i++;
      while (i < len) {
        const c = code[i];
        result += c;
        if (c === '\\') {
          i++;
          if (i < len) result += code[i];
        } else if (c === quote) {
          break;
        }
        i++;
      }
      i++;
      continue;
    }

    if (ch === '/' && next === '/') {
      i += 2;
      while (i < len && code[i] !== '\n') {
        i++;
      }
      continue;
    }

    if (ch === '/' && next === '*') {
      i += 2;
      while (i < len && !(code[i] === '*' && code[i + 1] === '/')) {
        i++;
      }
      if (i < len) {
        i += 2;
      }
      continue;
    }

    result += ch;
    i++;
  }

  return result
    .split('\n')
    .filter((line, idx, arr) => {
      if (line.trim() === '' && arr[idx - 1] && arr[idx - 1].trim() === '') {
        return false;
      }
      return true;
    })
    .join('\n');
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.output', '.wxt', 'dist'].includes(entry.name)) {
        continue;
      }
      processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx', '.html'].includes(ext) && entry.name !== 'strip-comments.js') {
        const original = fs.readFileSync(fullPath, 'utf8');
        const stripped = stripComments(original);
        if (original !== stripped) {
          fs.writeFileSync(fullPath, stripped, 'utf8');
          console.log(`Cleaned: ${path.relative(process.cwd(), fullPath)}`);
        }
      }
    }
  }
}

const targetDirs = [
  path.join(__dirname, '..', 'entrypoints'),
  path.join(__dirname, '..', 'lib'),
  path.join(__dirname, '..', 'types'),
  path.join(__dirname, '..', 'assets')
];

targetDirs.forEach((dir) => {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
});

console.log('Finished stripping comments!');
