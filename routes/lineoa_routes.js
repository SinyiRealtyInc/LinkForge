import express from 'express';
import * as line from '@line/bot-sdk';
import got from 'got';

const router = express.Router();

// LINE bot-sdk document
// https://line.github.io/line-bot-sdk-nodejs/guide/webhook.html
// https://github.com/line/line-bot-sdk-nodejs/blob/master/examples/echo-bot-esm/index.js
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const config = { channelSecret: LINE_CHANNEL_SECRET };

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN
});

router.get("/home", (req, res) => {
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: "🎉 Welcome to LINE OA home."
  });
});

router.get("/redirect", (req, res) => {
  res.status(200).json({
    status: true,
    errCode: "00000",
    message: "🎉 Success to redirect."
  });
});

// LINE Message Webhook
router.post('/webhook', line.middleware(config), (req, res) => {
  console.log(`${JSON.stringify(req.body)}`);
  Promise.all(req.body.events.map(handleEvent))
  .then((result) => res.json(result))
  .catch((error) => {
    console.error('Webhook 處理失敗：', error);
    res.status(500).end();
  });
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create an echoing text message
  const echo = { type: 'text', text: 'echo ' + event.message.text };

  await chatAnimation(event.source.userId, 3);
  await delay(2000);

  // use reply API
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [echo],
  });
}

/**
 * LINE OA chat animation
 * @param {string} lineId 
 * @param {int} seconds 
 */
async function chatAnimation(lineId, seconds) {
  return got(
    'https://api.line.me/v2/bot/chat/loading/start', 
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      json: {
        'chatId': lineId,
        'loadingSeconds': Math.max(seconds, 5)
      }
    }
  );
}

/**
 * 等待 n 毫秒
 * @param {*} ms 延遲毫秒
 * @returns 
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default router;