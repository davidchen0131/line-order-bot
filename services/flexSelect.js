// services/flexSelect.js
import { userStates } from './userStates.js';    // 或 dispatcher 把 userStates export 出來
import { Client }     from '@line/bot-sdk';

export async function handleFlexSelect(event, client, product) {
  const userId = event.source.userId;
  // 初始化 state
  if (!userStates[userId]) {
    userStates[userId] = { step: 0, data: {} };
  }
  userStates[userId].data.product = product;
  // 直接進到「等待數量」步驟
  userStates[userId].step = 2;

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `你選擇了：${product}\n請輸入數量：`
  });
}
export function getEditOptionsFlex() {
  return {
    type: "flex",
    altText: "請選擇要修改的項目",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [{ type: "text", text: "🛠 修改資料", weight: "bold", size: "lg" }]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "postback",
              label: "✏️ 修改常用資料",
              data: "EDIT_PROFILE"
            }
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "postback",
              label: "📝 修改某筆訂單",
              data: "EDIT_ORDER_SELECT"
            }
          }
        ]
      }
    }
  };
}

export function getMainMenuFlex() {
  return {
    type: "flex",
    altText: "主選單",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [{ type: "text", text: "📋 主選單", weight: "bold", size: "lg" }]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "message",
              label: "🛒 下單",
              text: "我要下單"
            }
          },
          {
            type: "button",
            style: "secondary",
            action: {
              type: "postback",
              label: "🛠 修改收件資料",
              data: "SHOW_EDIT_MENU"
            }
          }
        ]
      }
    }
  };
}