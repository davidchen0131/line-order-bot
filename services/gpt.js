// services/gpt.js
import OpenAI from 'openai';
import config from '../config.js';

const opts = { apiKey: config.openai.apiKey };
if (config.openai.organization) {
  opts.organization = config.openai.organization;
}
const openai = new OpenAI(opts);

/**
 * 根據使用者自然語言下單指令，
 * 回傳純 JSON 格式的訂單資料：
 * {
 *   "items": [
 *     { "product": "綠茶", "quantity": "2" },
 *     …
 *   ],
 *   "name": "...",
 *   "phone": "...",
 *   "address": "..."
 * }
 */
export async function askGPTForOrder(message) {
  const systemPrompt = `你是一位 LINE 商店助理，請從使用者自然語言中擷取訂單資訊，並回傳符合以下格式的純 JSON：
{
  "items": [
    { "product": "綠茶", "quantity": "2" },
    { "product": "紅茶", "quantity": "1" }
  ],
  "name": "王小明",
  "phone": "0912345678",
  "address": "台北市信義區忠孝東路123號"
}
請僅輸出 JSON，不要多餘文字或格式。`;

  try {
    const res = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: message       }
      ]
    });
    return res.choices[0].message.content.trim();
  } catch (err) {
    console.error('❌ GPT askGPTForOrder 錯誤:', err);
    throw err;
  }
}

export async function askGPTForIntent(message) {
  const system = `你是一位茶品推荐助理，使用者表达的是「偏好口味」，  
请在“recommend”字段里的 product 只能是“綠茶”、“紅茶”或“烏龍茶”三选一，  
不要返回“茶”或其他空泛名称。  
回傳純 JSON，不要多餘文字。範例輸出：
{
  "intent": "recommendation",
  "recommend": {
    "product": "綠茶",
    "message": "推薦您綠茶，它擁有清雅的豆香與回甘特性，非常適合您的喜好。"
  }
}

或：

{
  "intent": "order",
  "order": {
    "items": [
      { "product": "綠茶", "quantity": "2" },
      { "product": "紅茶", "quantity": "1" }
    ],
    "name": "王小明",
    "phone": "0912345678",
    "address": "台北市信義區忠孝東路123號"
  }
}`;
  const res = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: message }
    ]
  });
  return res.choices[0].message.content.trim();
}
