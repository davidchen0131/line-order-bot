import fs from 'fs';
import path from 'path';

export function loadEnv(filename = '.env') {
  try {
    const envPath = path.resolve(process.cwd(), filename);
    const data = fs.readFileSync(envPath, 'utf8');
    for (const line of data.split(/\r?\n/)) {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1];
        const value = match[2];
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (err) {
    // ignore missing .env
  }
}

loadEnv();
