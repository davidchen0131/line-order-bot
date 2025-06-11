// services/userProfile.js
import { google } from 'googleapis';
import config from '../config.js';

// 初始化 auth & sheetsApi（和 sheets.js 一樣）
const auth = new google.auth.GoogleAuth({
  keyFile: config.google.keyFile,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});
const sheetsApi = google.sheets({ version: 'v4' });

// 讀取「最新一筆」的完整使用者資料
export async function getLatestProfile(userId) {
  const client = await auth.getClient();
  const res = await sheetsApi.spreadsheets.values.get({
    auth: client,
    spreadsheetId: config.google.spreadsheetId,  // ← 一定要有
    range: 'Users!A:E'                          // ← 一定要有
  });
  const rows = res.data.values?.slice(1) || [];
  // 篩出屬於這個 userId 的列
  const userRows = rows.filter(r => r[0] === userId);
  if (userRows.length === 0) return null;
  // 取最後一筆
  const [ , name, phone, address ] = userRows[userRows.length - 1];
  return { name, phone, address };
}

// 讀取所有常用地址陣列
export async function getAddresses(userId) {
  const client = await auth.getClient();
  const res = await sheetsApi.spreadsheets.values.get({
    auth: client,
    spreadsheetId: config.google.spreadsheetId,
    range: 'Users!A:E'
  });
  const rows = res.data.values?.slice(1) || [];
  return rows
    .filter(r => r[0] === userId)
    .map(r => r[3]);  // address 在第 4 欄
}
export async function getAllProfiles(userId) {
  const client = await auth.getClient();
  const res = await sheetsApi.spreadsheets.values.get({
    auth: client,
    spreadsheetId: config.google.spreadsheetId,
    range: 'Users!A:E'
  });
  const rows = res.data.values?.slice(1) || [];
  return rows
    .filter(r => r[0] === userId)
    .map(r => ({
      name:    r[1],
      phone:   r[2],
      address: r[3]
    }));
}

/** 新增或更新使用者資料 */
export async function upsertUserProfile(userId, { name, phone, address }) {
  const client = await auth.getClient();

  const USER_RANGE = 'Users!A1:E1000';

  const res = await sheetsApi.spreadsheets.values.get({
    auth: client,
    spreadsheetId: config.google.spreadsheetId,
    range: USER_RANGE
  });

  const rows = res.data.values || [];
  const header = rows[0];
  const dataRows = rows.slice(1);

  const idx = dataRows.findIndex(r => r[0] === userId);
  const timestamp = new Date().toISOString();
  const values = [userId, name, phone, address, timestamp];

  if (idx >= 0) {
    const rowNum = idx + 2;
    await sheetsApi.spreadsheets.values.update({
      auth: client,
      spreadsheetId: config.google.spreadsheetId,
      range: `Users!A${rowNum}:E${rowNum}`,
      valueInputOption: 'RAW',
      requestBody: { values: [values] }
    });
  } else {
    await sheetsApi.spreadsheets.values.append({
      auth: client,
      spreadsheetId: config.google.spreadsheetId,
      range: USER_RANGE,
      valueInputOption: 'RAW',
      requestBody: { values: [values] }
    });
  }
}


