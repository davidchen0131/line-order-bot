import { userStates } from '../services/userStates.js';
import { handleOrderFlow } from './orderFlow.js';
import { handleEditProfile } from './editProfileFlow.js';
import { handleEditOrderSelect } from './editOrderFlow.js';

export default async function stepFlow(event, client) {
  const userId = event.source.userId;
  const msg = event.message?.text?.trim();
  const state = userStates[userId] ||= { step: 0, data: {} };

  if (event.postback?.data === 'EDIT_PROFILE') {
    userStates[userId] = { step: 'EDIT_1', data: userStates[userId]?.data || {} };
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: '🛠 請輸入新的收件人姓名：'
    });
  }

  if (event.postback?.data === 'EDIT_ORDER_SELECT') {
    return handleEditOrderSelect(event, client);
  }

  if (state.step?.toString().startsWith('EDIT_')) {
    return handleEditProfile(event, client);
  }

  return handleOrderFlow(event, client, userId, state, msg);
}
