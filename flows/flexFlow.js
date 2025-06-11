// flows/flexFlow.js
import { generateCarouselFlex } from '../utils/flex.js';

/**
 * 處理「選購商品」Carousel 選單
 */
export default async function flexFlow(event, client) {
  const flex = generateCarouselFlex();
  return client.replyMessage(event.replyToken, flex);
}