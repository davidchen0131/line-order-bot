// index.js

process.on('unhandledRejection', (reason, promise) => {
  console.error('⛔️ UNHANDLED REJECTION:', reason);
});

import './utils/loadEnv.js';
import express from 'express';
import path from 'path';
// 如果你用 ESM，需要這兩行來取得 __dirname：
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
import stepFlow from './flows/stepFlow.js'; 
import { middleware, Client } from '@line/bot-sdk';
import config from './config.js';
import { initSheetHeader }   from './services/sheets.js';
import { dispatchEvent }     from './services/dispatcher.js';

const app = express();
const client = new Client(config.line);
app.use('/liff', express.static(path.join(__dirname, 'public')));
// 初次啟動時初始化表頭
initSheetHeader().catch(console.error);

// Webhook
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  middleware(config.line),
  async (req, res) => {
    const body = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString())
      : req.body;
    const events = body.events || [];

    const results = await Promise.all(
      events.map(async event => {
        try {
          if(event.type ==='postback'){
            return stepFlow(event, client);
          }
          if (event.type === 'message' && event.message.type === 'text') {
            return await dispatchEvent(event, client);
          }
          return null;
        } catch (err) {
          console.error('❌ webhook event error:', err);
          return null;
        }
      })
    );

    res.status(200).json(results);
  }
);

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Bot running');
});
