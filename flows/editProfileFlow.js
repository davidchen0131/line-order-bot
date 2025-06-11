import { upsertUserProfile } from '../services/userProfile.js';
import { appendOrder } from '../services/sheets.js';
import { userStates } from '../services/userStates.js';
import { getZipCodeByAddress } from '../utils/zipUtils.js'; 

export async function handleEditProfile(event, client) {
  const userId = event.source.userId;
  const msg = event.message?.text?.trim();
  const state = userStates[userId] ||= { step: 'EDIT_1', data: {} };

  switch (state.step) {
    case 'EDIT_1':
      state.data.name = msg;
      state.step = 'EDIT_2';
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '🛠 請輸入新的聯絡電話：'
      });

    case 'EDIT_2':
      // ✅ 格式驗證：電話至少 9 位數且純數字
  if (!/^\d{9,}$/.test(msg)) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '⚠️ 請輸入正確的手機號碼（至少 9 位數數字）'
    });
  }
      state.data.phone = msg;

      state.step = 'EDIT_3';
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '🛠 請輸入新的收件地址：'
      });

    case 'EDIT_3': {
      // ✅ 格式驗證：地址至少 5 字
  if (msg.length < 5) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '📍 地址太短囉，請重新輸入正確地址'
    });
  }

  state.data.address = msg;

      try {
         const zip = await getZipCodeByAddress(msg);
  if (zip) state.data.address = `${zip} ${msg}`;
        await upsertUserProfile(userId, {
          name: state.data.name,
          phone: state.data.phone,
          address: state.data.address
        });

        state.data.orderTime = new Date().toISOString();
        state.data.orderGroupId = `${state.data.name}-${state.data.phone}-${Date.now()}`;
        state.data.userId = userId;

        await appendOrder(state.data);
        userStates[userId] = null;

        return client.replyMessage(event.replyToken, {
          type: 'text',
          text:
            `✅ 已更新您的資料並完成下單：\n` +
            `商品：${state.data.product}\n` +
            `數量：${state.data.quantity}\n` +
            `收件人：${state.data.name}\n` +
            `電話：${state.data.phone}\n` +
            `地址：${state.data.address}`
        });
      } catch (err) {
        console.error('寫入失敗 (EDIT_3)', err);
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '❌ 更新或下單失敗，請稍後再試'
        });
      }
    }

    default:
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '⚠️ 未知的修改流程狀態'
      });
  } // ← 這個是 switch 的結尾
}     // ← 這個是 async function 的結尾
