import naturalFlow from '../flows/naturalFlow.js';
import flexFlow from '../flows/flexFlow.js';
import stepFlow from '../flows/stepFlow.js';
import { askGPTForIntent } from './gpt.js';
import { generateTeaFlex } from '../utils/flex.js';
import { userStates } from './userStates.js';
import { handleFlexSelect } from './flexSelect.js';
import { getMainMenuFlex, getEditOptionsFlex } from './flexSelect.js';

export async function dispatchEvent(event, client) {
  const msg = event.message?.text?.trim();
  const userId = event.source.userId;

  // ✅ 使用者輸入「選單」 → 顯示主選單
  if (msg === '選單') {
    return client.replyMessage(event.replyToken, getMainMenuFlex());
  }

  // ✅ 點擊主選單中的「修改收件資料」Postback
  if (event.postback?.data === 'SHOW_EDIT_MENU') {
    return client.replyMessage(event.replyToken, getEditOptionsFlex());
  }

  // ✅ 判斷是否應進入多輪流程
  const state = userStates[userId];
  const shouldUseStepFlow =
    (state && state.step && state.step !== 0) ||
    ['__CONFIRM_PROFILE__', '__EDIT_PROFILE__'].includes(msg);

  if (shouldUseStepFlow) {
    return stepFlow(event, client);
  }

  // ✅ 使用者輸入「選購商品」 → 顯示 Flex 商品列表
  if (msg === '選購商品') {
    return flexFlow(event, client);
  }

  // ✅ 使用者從 Flex 中點了「我要下單｜產品名」
  if (msg.startsWith('我要下單｜')) {
    const product = msg.split('｜')[1];
    return handleFlexSelect(event, client, product);
  }

  // ✅ 直接輸入「下單」
  if (msg === '下單') {
    return stepFlow(event, client);
  }

  // ✅ AI 分析使用者輸入意圖（intent: order 或 recommendation）
  let intentRaw;
  try {
    intentRaw = await askGPTForIntent(msg);
  } catch {
    return stepFlow(event, client);
  }

  const cleaned = intentRaw.replace(/```json\s*/, '').replace(/```/g, '').trim();
  let intent;
  try {
    intent = JSON.parse(cleaned);
  } catch {
    return stepFlow(event, client);
  }

  if (intent.intent === 'recommendation' && intent.recommend) {
    const { product, message: recMsg } = intent.recommend;
    return client.replyMessage(event.replyToken, [
      { type: 'text', text: recMsg },
      generateTeaFlex(product)
    ]);
  }

  if (intent.intent === 'order' && intent.order) {
    return naturalFlow(event, client);
  }

  // ✅ fallback：訊息長度過長也當作自然語言下單
  if (msg.length > 5) {
    return naturalFlow(event, client);
  }

  // ✅ 最後 fallback：進入多輪 stepFlow
  return stepFlow(event, client);
}
