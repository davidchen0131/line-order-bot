process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});
// services/sheets.js
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

// 服務帳戶驗證
const auth = new google.auth.GoogleAuth({
  keyFile: config.google.keyFile,  // ✅ 只吃 config 的絕對路徑！
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheetsApi = google.sheets({ version: 'v4' });

// 你要的表頭欄位
const HEADER_ROW = [
  '商品名稱',
  '數量',
  '姓名',
  '電話',
  '地址',
  '使用者ID',
  '訂單時間',
  '訂單群組ID'
];

/**
 * 初始化或校驗工作表的第一列表頭：
 * - 如果 A1:H1 沒有表頭或內容不符，則覆寫成 HEADER_ROW
 */
export async function initSheetHeader() {
  const client = await auth.getClient();
  // 讀取現有 A1:H1
  const getRes = await sheetsApi.spreadsheets.values.get({
    auth: client,
    spreadsheetId: config.google.spreadsheetId,
    range: '訂單!A1:H1'
  });

  const existing = (getRes.data.values && getRes.data.values[0]) || [];
  // 比對現有內容是否與 HEADER_ROW 完全相同
  const needsInit = existing.length !== HEADER_ROW.length
    || HEADER_ROW.some((h, i) => existing[i] !== h);

  if (!needsInit) return; // 已初始化過，不用再改

  // 覆寫表頭
  await sheetsApi.spreadsheets.values.update({
    auth: client,
    spreadsheetId: config.google.spreadsheetId,
    range: '訂單!A1:H1',
    valueInputOption: 'RAW',
    requestBody: { values: [HEADER_ROW] }
  });
}

/**
 * 將單一筆訂單寫入 Google Sheets（A:H）
 */
export async function appendOrder(order) {
  const client = await auth.getClient();

  const values = [[
    order.product   ?? '',
    order.quantity  ?? '',
    order.name      ?? '',
    order.phone     ?? '',
    order.address   ?? '',
    order.userId    ?? '',
    order.orderTime ?? '',
    order.orderGroupId ?? ''
  ]];

  // －－ 在發送前先印一次 values －－
  console.log('🟢 appendOrder values:', JSON.stringify(values));

  try {
    const res = await sheetsApi.spreadsheets.values.append({
      auth: client,
      spreadsheetId: config.google.spreadsheetId,
      range: '訂單!A:H',
      valueInputOption: 'RAW',
      requestBody: { values }
    });
    // －－ 成功也印一次回傳內容 －－
    console.log('✅ appendOrder success:', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    // －－ 一定要印出錯誤與 values －－
    console.error('❌ appendOrder ERROR:', err);
    console.error('❌ appendOrder values at error:', JSON.stringify(values));
    // 不要 swallow 掉，抛給上層去 catch
    throw err;
  }
}
export async function getAllOrders(userId) {
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = '你的 Sheet ID';
  const range = '訂單!A1:Z1000';

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const rows = res.data.values;

  // 過濾此 user 的訂單
  const header = rows[0];
  const userOrders = rows.slice(1).filter(row => row[0] === userId)
    .map((row, index) => ({
      id: row[1],
      name: row[2],
      phone: row[3],
      address: row[4],
      rowIndex: index + 2 // 實際在 Sheet 的位置
    }));

  return userOrders;
}
