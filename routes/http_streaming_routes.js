import express, { json } from "express";

const router = express.Router();

let cache = new Map();

router.get("/home", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Welcome to HTTP Streaming home."
  };

  res.status(200).send(JSON.stringify(result));
});

// SSE 連線
router.get("/connect/:uuid", (req, res) => {
  let { uuid } = req.params;

  if (cache.get(uuid) === undefined) {
    cache.set(uuid, res);
  }

  // 設定標頭，啟用 SSE 模式
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 立即發送一次連線確認訊息（避免某些 Proxy idle timeout）
  res.write('event: connect\ndata: 連線成功\n\n');

  // 清理資源：客戶端斷線就停止推送
  res.on('close', () => {
    console.log(`🔌 客戶端:${uuid} 斷線，中止推送。`);
    cache.delete(uuid);
    res.end();
  });
});

// SSE 發送訊息
router.get("/event/:uuid", (req, res) => {
  let { uuid } = req.params;
  const cacheRes = cache.get(uuid);

  let output = {
      "status": true,
      "message": `⏱️ 目前時間：${new Date().toISOString()}`
  };

  // 發送格式遵循 whatwg spec
  // Reference = https://html.spec.whatwg.org/multipage/server-sent-events.html
  if (cacheRes) {
    cacheRes.write(`data: ${JSON.stringify(output)}\n\n`);
    return res.status(200).json(output);
  } else {
    output.status = false;
    output.message = `客戶:${uuid} 不存在`;
    return res.status(400).json(output);
  }
});

export default router;