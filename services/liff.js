// services/liff.js
export function buildLiffFlex() {
  const liffUrl = `https://liff.line.me/1580306632-9lkpdrwb`;


  return {
    type: 'flex',
    altText: '點我填寫訂單表單',
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: '📋 填寫訂單資訊', weight: 'bold', size: 'md' },
          { type: 'text', text: '點擊下方按鈕，填寫並送出訂單。' }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            action: {
              type:     'uri',          // ← 這裡要是 uri
              label:    '填寫訂單',
              uri:      liffUrl,   // ← 深鏈到你的 LIFF
              
            }
          }
        ]
      }
    }
  };
}