// config.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export default {
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret:      process.env.LINE_CHANNEL_SECRET
  },
  google: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    // 自動拼成 services/yourfile.json
      keyFile: path.resolve(process.cwd(), process.env.GOOGLE_KEY_FILE)
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model:  process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  }
  
};
