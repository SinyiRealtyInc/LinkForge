import express from "express";

const router = express.Router();

router.get("/home", (req, res) => {
  let result = {
    "status": true,
    "errCode": "00000",
    "message": "🎉 Welcome to HTTP Streaming home."
  };

  res.status(200).send(JSON.stringify(result));
});

router.get("/event", (req, res) => {
  // 設定標頭，啟用 SSE 模式
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 立即發送一次連線確認訊息（避免某些 Proxy idle timeout）
  res.write('event: connect\ndata: 連線成功\n\n');

  // 每2秒推送一則訊息
  const interval = setInterval(() => {
    const output = {
      "status": true,
      "message": `⏱️ 目前時間：${new Date().toISOString()}`
    };

    // 發送格式遵循 whatwg spec
    // Reference = https://html.spec.whatwg.org/multipage/server-sent-events.html
    res.write(`data: ${JSON.stringify(output)}\n\n`);
  }, 2000);

  // 清理資源：客戶端斷線就停止推送
  res.on('close', () => {
    console.log('🔌 客戶端斷線，中止推送。');
    clearInterval(interval);
    res.end();
  });
});

export default router;