// utils/format.js

/**
 * 將解析後的訂單 JSON 轉成文字確認訊息
 */
export function buildConfirmationText(parsed) {
  let text = `✅ 已為您建立訂單：\n`;
  parsed.items.forEach(item => {
    text += `- ${item.product} x${item.quantity}\n`;
  });
  text += `收件人：${parsed.name}\n電話：${parsed.phone}\n地址：${parsed.address}`;
  return text;
}

/**
 * 將使用者傳入的電話補零
 */
export function formatPhone(phone) {
  const p = phone.trim();
  return p.startsWith('0') ? p : `0${p}`;
}
