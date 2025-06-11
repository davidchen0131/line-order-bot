// utils/zipUtils.js
import fetch from 'node-fetch';

export async function getZipCodeByAddress(address) {
  const res = await fetch(`https://zip5.5432.tw/zip5json.py?adrs=${encodeURIComponent(address)}`);
  const json = await res.json();
  return json.zipcode || '';
}