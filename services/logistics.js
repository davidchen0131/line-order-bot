import axios from 'axios';

export async function createLogisticsOrder(order) {
  try {
    const payload = {
      MerchantID: '2000933',
      LogisticsType: 'CVS',
      LogisticsSubType: order.logisticsSubType, // 'UNIMART' or 'FAMI'
      GoodsAmount: 1,
      CollectionAmount: 0,
      GoodsName: order.product,
      SenderName: '商店名稱',
      SenderPhone: '商店電話',
      ReceiverName: order.name,
      ReceiverPhone: order.phone,
      ReceiverStoreID: order.storeId,
      ServerReplyURL: '',
      ClientReplyURL: 'https://liff.line.me/1580306632-k8K1qPyV'
    };

    const { data } = await axios.post('https://logistics-stage.ecpay.com.tw/Express/Create', payload);
    console.log('建立物流訂單成功:', data);
    return data;
  } catch (error) {
    console.error('建立物流訂單失敗:', error);
    throw new Error('建立物流訂單失敗');
  }
}
