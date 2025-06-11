// utils/flex.js
export function generateTeaFlex(product) {
  const teaCatalog = {
    綠茶: {
      title: '綠茶',
      desc: '清香豆香、甘潤回甘',
      img: 'https://your-image-url.com/green.jpg',
      btnText: '選擇綠茶'
    },
    紅茶: {
      title: '紅茶',
      desc: '厚實圓潤，適合加奶或熱飲',
      img: 'https://your-image-url.com/black.jpg',
      btnText: '選擇紅茶'
    },
    烏龍茶: {
      title: '烏龍茶',
      desc: '花香焙火交織，層次豐富',
      img: 'https://your-image-url.com/oolong.jpg',
      btnText: '選擇烏龍茶'
    }
  };

  const tea = teaCatalog[product];
  return {
    type: 'flex',
    altText: `推薦商品：${tea.title}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: tea.img,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: tea.title, weight: 'bold', size: 'xl' },
          { type: 'text', text: tea.desc, wrap: true, size: 'sm', color: '#666666' }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'message',
              label: tea.btnText,
              text: `我要下單｜${tea.title}`
            },
            style: 'primary'
          }
        ]
      }
    }
  };
}

export function generateCarouselFlex() {
  return {
    type: 'flex',
    altText: '請選擇商品',
    contents: {
      type: 'carousel',
      contents: [
        {
          type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://your-image-url.com/green.jpg',
            size: 'full', aspectRatio: '20:13', aspectMode: 'cover'
          },
          body: {
            type: 'box', layout: 'vertical', contents: [
              { type: 'text', text: '綠茶', weight: 'bold', size: 'lg' },
              { type: 'text', text: '清香順口，適合日常飲用', size: 'sm', color: '#666666' }
            ]
          },
          footer: {
            type: 'box', layout: 'vertical', spacing: 'sm', contents: [
              { type: 'button',
                action: { type: 'message', label: '選擇綠茶', text: '我要下單｜綠茶' },
                style: 'primary'
              }
            ]
          }
        },
        {
          type: 'bubble',
          hero: {
            type: 'image',
            url: 'https://your-image-url.com/black.jpg',
            size: 'full', aspectRatio: '20:13', aspectMode: 'cover'
          },
          body: {
            type: 'box', layout: 'vertical', contents: [
              { type: 'text', text: '紅茶', weight: 'bold', size: 'lg' },
              { type: 'text', text: '濃郁圓潤，適合加奶', size: 'sm', color: '#666666' }
            ]
          },
          footer: {
            type: 'box', layout: 'vertical', spacing: 'sm', contents: [
              { type: 'button',
                action: { type: 'message', label: '選擇紅茶', text: '我要下單｜紅茶' },
                style: 'primary'
              }
            ]
          }
        }
      ]
    }
  };
}
