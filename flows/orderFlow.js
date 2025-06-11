import { appendOrder } from '../services/sheets.js';
import { getLatestProfile, getAllProfiles, upsertUserProfile } from '../services/userProfile.js';
import { buildLiffFlex } from '../services/liff.js';
import { userStates } from '../services/userStates.js';
import { getZipCodeByAddress } from '../utils/zipUtils.js';
import { createLogisticsOrder } from '../services/logistics.js';

async function fetchStoreInfo(storeName) {
  const storeMap = {
    '全家福科店': {
      id: 'F123456',
      address: '台中市西屯區福科路123號'
    },
    '7-11中科門市': {
      id: '7117890',
      address: '台中市西屯區中科路456號'
    }
  };
  return storeMap[storeName] || null;
}

export async function handleOrderFlow(event, client, userId, state, msg) {
  if (event.postback?.data?.startsWith('USE_PROFILE_')) {
    const idx = Number(event.postback.data.replace('USE_PROFILE_', ''));
    const profiles = await getAllProfiles(userId);
    const p = profiles[idx];

    Object.assign(state.data, {
      address: p.address,
      name: p.name,
      phone: p.phone,
      orderTime: new Date().toISOString(),
      orderGroupId: `${p.name}-${p.phone}-${Date.now()}`,
      userId
    });

    state.step = 'CONFIRM_PROFILE';

    return client.replyMessage(event.replyToken, {
      type: 'text',
      text:
        `✅ 以下是您選擇的收件資料：\n` +
        `收件人：${p.name}\n` +
        `電話：${p.phone}\n` +
        `地址：${p.address}\n\n` +
        `請問要使用這筆資料嗎？`,
      quickReply: {
        items: [
          {
            type: 'action',
            action: {
              type: 'message',
              label: '✅ 確認使用',
              text: '__CONFIRM_PROFILE__'
            }
          },
          {
            type: 'action',
            action: {
              type: 'message',
              label: '✏️ 修改資料',
              text: '__EDIT_PROFILE__'
            }
          }
        ]
      }
    });
  }

  if (msg === '填寫表單') {
    return client.replyMessage(event.replyToken, buildLiffFlex());
  }

  switch (state.step) {
    case 0:
      state.step = 1;
      return client.replyMessage(event.replyToken, { type: 'text', text: '請輸入商品名稱：' });

    case 1:
      state.data.product = msg;
      state.step = 2;
      return client.replyMessage(event.replyToken, { type: 'text', text: '請輸入數量：' });

    case 2:
      state.data.quantity = msg;
      state.step = 2.5;
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '請選擇取貨方式：',
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'message',
                label: '🏠 宅配到府',
                text: '__DELIVERY_HOME__'
              }
            },
            {
              type: 'action',
              action: {
                type: 'message',
                label: '🏪 超商取貨',
                text: '__DELIVERY_STORE__'
              }
            }
          ]
        }
      });

    case 2.5:
      if (msg === '__DELIVERY_HOME__') {
        state.data.delivery = '宅配';
        state.step = 3;
        return client.replyMessage(event.replyToken, { type: 'text', text: '請輸入收件人姓名：' });
      }
      if (msg === '__DELIVERY_STORE__') {
        state.step = 'WAIT_FOR_STORE_TYPE';
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '請選擇超商名稱：',
          quickReply: {
            items: [
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: '7-11',
                  text: '__STORE_711__'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: '全家',
                  text: '__STORE_FAMI__'
                }
              }
            ]
          }
        });
      }
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '請從選項中選擇配送方式。'
      });

    case 'WAIT_FOR_STORE_TYPE':
      if (msg === '__STORE_711__') {
  state.data.storeType = '711';
  state.data.delivery = '超商';
  state.step = 'WAIT_FOR_STORE_INPUT';

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text:
      '請點選下方連結開啟 7-11 門市地圖，選好後請手動輸入門市名稱 / 店號 / 地址：',
    quickReply: {
      items: [
        {
          type: 'action',
          action: {
            type: 'uri',
            label: '📍 7-11 門市地圖',
            uri: 'https://emap.pcsc.com.tw/ecmap/default.aspx'
          }
        }
      ]
    }
  });
}
      return client.replyMessage(event.replyToken, { type: 'text', text: '請選擇超商品牌。' });
case 'WAIT_FOR_STORE_INPUT':
  if (!msg.includes('店號') || !msg.includes('地址')) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '請輸入格式為：「門市名稱 店號：XXXX 地址：XXXX」'
    });
  }

  const match = msg.match(/(.+)\s+店號[:：]\s*(\w+)\s+地址[:：]\s*(.+)/);
  if (!match) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '⚠️ 格式錯誤，請重新輸入：「門市名稱 店號：XXXX 地址：XXXX」'
    });
  }

  const [ , name, id, address ] = match;
  state.data.storeName = name;
  state.data.storeId = id;
  state.data.address = address;
  state.data.name = '(超商取貨)';
  state.step = 4;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: '請輸入聯絡電話：'
  });

    case 'WAIT_FOR_STORE_SELECT':
      if (msg.startsWith('__STORE_SELECTED__')) {
        const [ , name, id, addr ] = msg.split('|');
        state.data.storeName = name;
        state.data.storeId = id;
        state.data.address = addr;
        state.data.name = '(超商取貨)';
        state.step = 4;
        return client.replyMessage(event.replyToken, { type: 'text', text: '請輸入聯絡電話：' });
      }
      return client.replyMessage(event.replyToken, { type: 'text', text: '請從 LIFF 選擇門市後繼續。' });

    case 3:
      state.data.name = msg;
      state.step = 4;
      return client.replyMessage(event.replyToken, { type: 'text', text: '請輸入聯絡電話：' });

    case 4:
      if (!/^\d{9,}$/.test(msg)) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '⚠️ 請輸入正確的手機號碼（至少 9 位數數字）'
        });
      }
      state.data.phone = msg;
      state.step = 5;
      const profiles = await getAllProfiles(userId);
      const items = profiles.slice(0, 3).map((p, i) => ({
        type: 'action',
        action: {
          type: 'postback',
          label: `${p.name} ${p.phone}`,
          data: `USE_PROFILE_${i}`
        }
      }));
      items.push({
        type: 'action',
        action: {
          type: 'postback',
          label: '➕ 新增收件資料',
          data: 'NEW_ADDRESS'
        }
      });
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '📍 請選擇常用地址，或點「➕ 新增收件資料」輸入新地址：',
        quickReply: { items }
      });

    case 5:
    case 6:
      if (msg.length < 5) {
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '📍 地址太短囉，請重新輸入正確地址'
        });
      }
      const zip = await getZipCodeByAddress(msg);
      state.data.address = zip ? `${zip} ${msg}` : msg;
      state.data.orderTime = new Date().toISOString();
      state.data.orderGroupId = `${state.data.name}-${state.data.phone}-${Date.now()}`;
      state.data.userId = userId;

      try {
        await upsertUserProfile(userId, {
          name: state.data.name,
          phone: state.data.phone,
          address: state.data.address
        });
        await appendOrder(state.data);
        if (state.data.delivery === '超商') {
          await createLogisticsOrder(state.data);
        }
        userStates[userId] = null;
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text:
            `✅ 訂單完成！\n` +
            `商品：${state.data.product}\n` +
            `數量：${state.data.quantity}\n` +
            `收件人：${state.data.name}\n` +
            `電話：${state.data.phone}\n` +
            `地址：${state.data.address}`
        });
      } catch (err) {
        console.error('寫入 Sheets 失敗 (orderFlow)', err);
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '❌ 寫入訂單失敗，請稍後再試'
        });
      }

    case 'CONFIRM_PROFILE':
      if (msg === '__CONFIRM_PROFILE__') {
        try {
          await appendOrder(state.data);
          if (state.data.delivery === '超商') {
            await createLogisticsOrder(state.data);
          }
          userStates[userId] = null;
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text:
              `✅ 訂單完成！\n` +
              `商品：${state.data.product}\n` +
              `數量：${state.data.quantity}\n` +
              `收件人：${state.data.name}\n` +
              `電話：${state.data.phone}\n` +
              `地址：${state.data.address}`
          });
        } catch (err) {
          console.error('寫入 Sheets 失敗 (確認後)', err);
          return client.replyMessage(event.replyToken, {
            type: 'text',
            text: '❌ 寫入訂單失敗，請稍後再試'
          });
        }
      }

      if (msg === '__EDIT_PROFILE__') {
        state.step = 'EDIT_1';
        return client.replyMessage(event.replyToken, {
          type: 'text',
          text: '✏️ 好的，請重新輸入收件人姓名：'
        });
      }

      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '請點選「確認使用」或「修改資料」'
      });

    default:
      return null;
  }
}
