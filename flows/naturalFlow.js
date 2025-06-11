// flows/naturalFlow.js
import { askGPTForOrder } from '../services/gpt.js';
import { appendOrder }     from '../services/sheets.js';
import { buildConfirmationText, formatPhone } from '../utils/format.js';

/**
 * 處理「長句下單」流程：
 * 1. GPT 解析 JSON
 * 2. 寫入 Google Sheets
 * 3. 回覆文字確認
 */
export default async function naturalFlow(event, client) {
  const msg   = event.message.text.trim();
  const reply = await askGPTForOrder(msg);

  console.log('[naturalFlow][GPT 回覆]', reply);
  let parsed;
  try {
    parsed = JSON.parse(reply);
  } catch {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '⚠️ 無法解析訂單格式，請確認輸入。'
    });
  }

  for (const item of parsed.items) {
    const timestamp = new Date().toISOString();
    await appendOrder({
      product:       item.product,
      quantity:      item.quantity,
      name:          parsed.name,
      phone:         formatPhone(parsed.phone),
      address:       parsed.address,
      userId:        event.source.userId,
      orderTime:     timestamp,
      orderGroupId:  `${parsed.name}-${parsed.phone}-${Date.now()}`
    });
  }

  const confirmation = buildConfirmationText(parsed);
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: confirmation
  });
}
