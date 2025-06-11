import { getAllOrders } from '../services/sheets.js';

export async function handleEditOrderSelect(event, client) {
  const userId = event.source.userId;
  const orders = await getAllOrders(userId);
  if (!orders.length) {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '❌ 找不到任何訂單記錄'
    });
  }

  const reply = {
    type: 'text',
    text: '請選擇要修改的訂單：',
    quickReply: {
      items: orders.slice(0, 10).map((order, i) => ({
        type: 'action',
        action: {
          type: 'postback',
          label: `#${order.id}`,
          data: `EDIT_ADDRESS_${i}`
        }
      }))
    }
  };

  return client.replyMessage(event.replyToken, reply);
}
